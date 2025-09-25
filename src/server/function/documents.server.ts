import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { fileEnv } from '~/conf/file';
import { db } from '~/db/client';
import { auth } from '~/server/auth.server';
import { S3StaticFileImpl } from '~/server/s3/s3';

const fileService = new S3StaticFileImpl();

const requireUser = async () => {
  const { headers } = getWebRequest();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw new Error('UNAUTHORIZED');
  }

  return session.user;
};

const sanitizeFileName = (name?: string | null) => {
  const fallback = `file-${Date.now()}`;
  const safeInput = name && name.length > 0 ? name : fallback;

  return safeInput
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
};

const buildObjectKey = (userId: string, originalName: string) => {
  const prefix = fileEnv.S3_PREFIX ? fileEnv.S3_PREFIX.replace(/\/*$/, '') + '/' : '';
  const safeName = sanitizeFileName(originalName);
  return `${prefix}${userId}/${Date.now()}-${randomUUID()}-${safeName}`;
};

const initUploadSchema = z.object({
  originalName: z.string().min(1),
  mimeType: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  addToKnowledgeBase: z.boolean().optional(),
});

const completeUploadSchema = z
  .object({
    id: z.string().min(1).optional(),
    key: z.string().min(1).optional(),
  })
  .refine((v) => Boolean(v.id) || Boolean(v.key), 'Either id or key is required');

const directUploadSchema = z.object({
  id: z.string().min(1).optional(),
  key: z.string().min(1).optional(),
  originalName: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  content: z.string().min(1),
  mimeType: z.string().optional(),
});

export type InitDocumentUploadInput = z.infer<typeof initUploadSchema>;
export type CompleteDocumentUploadInput = z.infer<typeof completeUploadSchema>;
export type DirectDocumentUploadInput = z.infer<typeof directUploadSchema>;

const normalizeInput = <TSchema extends z.ZodTypeAny>(
  input: unknown,
  schema: TSchema,
): z.infer<TSchema> => {
  const rawCandidate =
    input instanceof FormData
      ? Object.fromEntries(input.entries())
      : typeof input === 'string'
        ? JSON.parse(input)
        : input ?? {};
  const candidate = Array.isArray(rawCandidate)
    ? rawCandidate[0] ?? {}
    : rawCandidate;

  let payload =
    candidate && typeof candidate === 'object'
      ? { ...(candidate as Record<string, unknown>) }
      : candidate;

  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    payload = (payload as Record<string, unknown>).data ?? {};
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if ('size' in record) {
      const sizeValue = record.size;
      record.size = typeof sizeValue === 'string' ? Number(sizeValue) : sizeValue;
    }
    if ('addToKnowledgeBase' in record) {
      const kbValue = record.addToKnowledgeBase;
      record.addToKnowledgeBase = kbValue === 'true' || kbValue === true;
    }
  }

  return schema.parse(payload);
};

export const listDocuments = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser();

  const fileRows = await db.file.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return Promise.all(
    fileRows.map(async (file) => ({
      ...file,
      downloadUrl: await fileService.getFullFileUrl(file.key),
    })),
  );
});

export const initDocumentUpload = createServerFn({ method: 'POST' })
  .validator((input) => normalizeInput(input, initUploadSchema))
  .handler(async (ctx) => {
    const input = ctx.data as InitDocumentUploadInput;
    const user = await requireUser();

    const originalName = input.originalName?.trim() || `file-${Date.now()}`;
    const key = buildObjectKey(user.id, originalName);
    const mimeType = input.mimeType ?? 'application/octet-stream';
    const size = input.size ?? 0;

    const shouldCreateDocument =
      !!input.addToKnowledgeBase || Boolean(input.content?.trim().length);

    const fileRecord = await db.$transaction(async (tx) => {
      const createdFile = await tx.file.create({
        data: {
          key,
          clientId: user.id,
          fileType: mimeType,
          name: originalName,
          size,
          url: '',
          mimeType: input.mimeType ?? null,
        }
      });

      if (!createdFile) {
        throw new Error('Failed to create file record');
      }

      if (shouldCreateDocument) {
        await tx.document.create({
          data: {
            title: input.title?.trim() || originalName,
            content: input.content ?? '',
            fileType: mimeType,
            filename: originalName,
            totalCharCount: input.content?.length ?? null,
            totalLineCount: input.content ? input.content.split(/\r?\n/).length : null,
            sourceType: input.addToKnowledgeBase ? 'knowledge-base' : 'upload',
            source: key,
            fileId: createdFile.id,
            userId: user.id,
            clientId: user.id,
          }
        });
      }

      return createdFile;
    });

    const uploadUrl = fileService.isPresignedEnabled()
      ? await fileService.createUploadPreSignedUrl(key)
      : null;

    return { id: fileRecord.id, key, uploadUrl };
  });

export const completeDocumentUpload = createServerFn({ method: 'POST' })
  .validator((input) => normalizeInput(input, completeUploadSchema))
  .handler(async (ctx) => {
    const data = ctx.data as CompleteDocumentUploadInput;

    const { id, key } = data;

    const user = await requireUser();

    let file = null;

    if (key) {
      file = await db.file.findFirst({
        where: { 
          key: key,
          clientId: user.id 
        }
      });
    }

    if (!file && id) {
      const candidate = await db.file.findUnique({
        where: { id: id }
      });
      if (candidate && candidate.clientId === user.id) {
        file = candidate;
      }
    }

    if (!file || (file.clientId && file.clientId !== user.id)) {
      throw new Error('File not found');
    }

    const url = await fileService.getFullFileUrl(file.key);
    const now = new Date();

    await db.file.update({
      where: { key: file.key },
      data: {
        url,
        updatedAt: now,
        accessedAt: now,
      }
    });

    return { id: file.id, url };
  });

export const directDocumentUpload = createServerFn({ method: 'POST' })
  .validator((input) => normalizeInput(input, directUploadSchema))
  .handler(async (ctx) => {
    const data = ctx.data as DirectDocumentUploadInput;

    const { id, key: inputKey, originalName, size, content, mimeType } = data;

    const user = await requireUser();
    const inferredName = originalName?.trim() || `file-${Date.now()}`;
    const inferredMime = mimeType ?? 'application/octet-stream';
    const inferredSize = size ?? 0;

    if (!content) {
      throw new Error('Missing upload content');
    }

    let fileRecord = null;

    if (id) {
      fileRecord = await db.file.findFirst({
        where: { 
          id: id,
          clientId: user.id 
        }
      });
    }

    if (!fileRecord && inputKey) {
      fileRecord = await db.file.findFirst({
        where: { 
          key: inputKey,
          clientId: user.id 
        }
      });
    }

    let resolvedKey = fileRecord?.key ?? inputKey ?? buildObjectKey(user.id, inferredName);

    if (!fileRecord) {
      const created = await db.file.create({
        data: {
          ...(id ? { id } : {}),
          key: resolvedKey,
          clientId: user.id,
          fileType: inferredMime,
          name: inferredName,
          size: inferredSize,
          url: '',
          mimeType: mimeType ?? null,
        }
      });

      if (!created) {
        throw new Error('Failed to create file record for upload');
      }

      fileRecord = created;
      resolvedKey = created.key;
    }

    if (fileRecord.clientId && fileRecord.clientId !== user.id) {
      throw new Error('File not found');
    }

    const buffer = Buffer.from(content, 'base64');
    await fileService.uploadContent(resolvedKey, buffer);

    const url = await fileService.getFullFileUrl(resolvedKey);
    const now = new Date();

    await db.file.update({
      where: { id: fileRecord.id },
      data: {
        url,
        fileType: mimeType ?? fileRecord.fileType,
        mimeType: mimeType ?? fileRecord.mimeType,
        name: inferredName,
        size: inferredSize,
        updatedAt: now,
        accessedAt: now,
      }
    });

    return { id: fileRecord.id, url };
  });

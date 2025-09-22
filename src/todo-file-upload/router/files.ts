import {fileRepo} from '@/database/repositories/file.repo';
import { publicProcedure, router } from '../trpc'
import { S3StaticFileImpl } from '@/services/file/s3';
import { createInsertSchema } from 'drizzle-zod';
import { files } from '@/database/schema';
import { TRPCError } from "@trpc/server"
import { z } from "zod";
import { randomUUID } from "node:crypto";

const fileProcedure = publicProcedure.use(async(opts) => {
  return opts.next({ ctx: { 
    fileModel: fileRepo,
    fileService: new S3StaticFileImpl()
   }})
})

const uploadFileSchema = createInsertSchema(files).extend({
  content: z.string().describe("Base-64 or UTF-8 file contents"),
});

const initUploadSchema = z.object({
  originalName: z.string(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
});

const completeUploadSchema = z.object({
  id: z.string(),
});

export const fileRouter = router({
  uploadFile: fileProcedure
  .input(uploadFileSchema)
  .mutation(async ({ ctx, input }) => {
    const { content, key: inputKey, ...fileData } = input;

    // Pick or generate an S3 object key
    const key =
      inputKey ??
      `files/\${Date.now()}-\${Math.random().toString(36).slice(2)}`;

    // Upload to S3; abort on failure
    try {
      await ctx.fileService.uploadContent(key, content);
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload file to storage",
        cause: err,
      });
    }

    // Insert metadata (including key) into DB
    const insertResult = await ctx.fileModel.insert({ ...fileData, key });
    const id = Array.isArray(insertResult)
      ? insertResult[0]?.id
      : insertResult?.id;

    if (!id) {
      // Roll back S3 upload if DB insert fails
      await ctx.fileService.deleteFile(key).catch(() => void 0);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create file record – insert returned no id",
      });
    }

    const url = await ctx.fileService.getFullFileUrl(key);
    return { id, url };
  }),
  initUpload: fileProcedure
    .input(initUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const { originalName, mimeType, size } = input;
      
      if (!ctx.fileService.isPresignedEnabled()) {
        const insert = await ctx.fileModel.insert({
          key: `direct/${randomUUID()}-${originalName}`,
          clientId: "local",
          fileType: mimeType ?? "application/octet-stream",
          name: originalName,
          size: size ?? 0,
          url: "",
          mimeType,
        })
        const id = Array.isArray(insert) ? insert[0]?.id : insert?.id
        return { id } // caller will now go straight to uploadFile
      }

      const key 
      = `files/${randomUUID()}-${originalName}`;
      const uploadUrl = await ctx.fileService.createUploadPreSignedUrl(key);

      const insertResult = await ctx.fileModel.insert({
        key,
        clientId: 'local',
        fileType: mimeType ?? 'application/octet-stream',
        name: originalName,
        size: size ?? 0,
        url: '',
        mimeType,
      });

      const id = Array.isArray(insertResult)
        ? insertResult[0]?.id
        : insertResult?.id;

      if (!id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create file record",
        });
      }

      return { id, key, uploadUrl };
    }),

  completeUpload: fileProcedure
    .input(completeUploadSchema)
    .mutation(async ({ ctx, input }) => {
      
      const file = await ctx.fileModel
        .find()
        .where({ id: input.id })
        .returnOne();

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      // Mark as ready
      const signedUrl = await ctx.fileService.getFullFileUrl(file.key);
      await ctx.fileModel.update(
        { id: input.id },
        { status: 'ready', url: signedUrl },
      );

      return { id: file.id, url: signedUrl };
    }),
  getFiles: fileProcedure
    .query(async({ctx, input}) => {
      const files = await ctx.fileModel.find().returnMany();
      return files
    })
})
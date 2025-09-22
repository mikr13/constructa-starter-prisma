import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const DEFAULT_S3_FILE_PATH = "files"

export const fileEnv = createEnv({
  server: {
    S3_ENDPOINT: z.string().url().optional(),
    S3_REGION: z.string().optional(),

    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_BUCKET: z.string().min(1),

    S3_ENABLE_PATH_STYLE: z.boolean().optional(),
    S3_PUBLIC_DOMAIN: z.string().url().optional(),

    S3_PREVIEW_URL_EXPIRE_IN: z
      .number()
      .int()
      .positive()
      .refine(Number.isFinite, 'S3_PREVIEW_URL_EXPIRE_IN must be finite'),

    // optional path prefix inside the bucket (e.g. "uploads/")
    S3_PREFIX: z.string().optional(),

    // secret needed when using explicit credential injection for MinIO and other S3 compatible providers
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    USE_PRESIGNED_UPLOAD: z.boolean().optional(),
  },
  runtimeEnv: {
    // client-facing values (keep the VITE_ prefix!)
    VITE_S3_PUBLIC_DOMAIN: process.env.VITE_S3_PUBLIC_DOMAIN,
    VITE_S3_FILE_PATH: process.env.VITE_S3_FILE_PATH ?? DEFAULT_S3_FILE_PATH,

    // raw server secrets
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ENABLE_PATH_STYLE:
      process.env.S3_ENABLE_PATH_STYLE === undefined
        ? undefined
        : process.env.S3_ENABLE_PATH_STYLE === '1',
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_PREVIEW_URL_EXPIRE_IN: Number(process.env.S3_PREVIEW_URL_EXPIRE_IN ?? 7200),
    S3_PUBLIC_DOMAIN: process.env.S3_PUBLIC_DOMAIN ?? process.env.VITE_S3_PUBLIC_DOMAIN,
    S3_REGION: process.env.S3_REGION,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_PREFIX: process.env.S3_PREFIX,
    USE_PRESIGNED_UPLOAD:
      process.env.USE_PRESIGNED_UPLOAD === undefined
        ? undefined
        : process.env.USE_PRESIGNED_UPLOAD === 'true',
  },
  emptyStringAsUndefined: true,
});

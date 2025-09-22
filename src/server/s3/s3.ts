import { FileStorage } from '@flystorage/file-storage';
import { AwsS3StorageAdapter } from '@flystorage/aws-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { fileEnv } from '~/conf/file';
import { IFileService } from './types';

const DEFAULT_REGION = 'us-east-1';

export class S3StaticFileImpl implements IFileService {
  private storage: FileStorage;
  private client: S3Client;
  private readonly usePresignedUploads: boolean;
  private readonly previewUrlExpiresIn: number;

  constructor() {
    if (!fileEnv.S3_BUCKET) {
      throw new Error('S3_BUCKET is not configured');
    }

    this.usePresignedUploads = fileEnv.USE_PRESIGNED_UPLOAD ?? false;
    this.previewUrlExpiresIn = fileEnv.S3_PREVIEW_URL_EXPIRE_IN;

    const endpoint = fileEnv.S3_ENDPOINT;
    const credentials =
      fileEnv.S3_ACCESS_KEY_ID && fileEnv.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: fileEnv.S3_ACCESS_KEY_ID,
            secretAccessKey: fileEnv.S3_SECRET_ACCESS_KEY,
          }
        : undefined;
    const forcePathStyle =
      fileEnv.S3_ENABLE_PATH_STYLE ?? (endpoint ? true : undefined);

    const client = new S3Client({
      region: fileEnv.S3_REGION ?? DEFAULT_REGION,
      endpoint,
      ...(forcePathStyle !== undefined ? { forcePathStyle } : {}),
      ...(credentials ? { credentials } : {}),
    });
    this.client = client;

    const adapter = new AwsS3StorageAdapter(client, {
      bucket: fileEnv.S3_BUCKET,
      prefix: fileEnv.S3_PREFIX ?? '', // optional folder prefix within bucket
    });
    this.storage = new FileStorage(adapter);
  }

  deleteFile(key: string) {
    return this.storage.deleteFile(key);
  }

  deleteFiles(keys: string[]) {
    return Promise.all(keys.map((k) => this.storage.deleteFile(k)));
  }

  getFileContent(key: string) {
    return this.storage.readToString(key);
  }

  getFileByteArray(key: string) {
    return this.storage.readToUint8Array(key);
  }

  async createPreSignedUrl(key: string, expiresIn = this.previewUrlExpiresIn) {
    const ttlSeconds = expiresIn ?? this.previewUrlExpiresIn;
    const expiresAt = Date.now() + ttlSeconds * 1000;
    let url = await this.storage.temporaryUrl(key, { expiresAt });

    if (fileEnv.S3_ENDPOINT) {
      const endpoint = new URL(fileEnv.S3_ENDPOINT);
      const signedUrl = new URL(url);
      signedUrl.host = endpoint.host;
      signedUrl.protocol = endpoint.protocol;
      url = signedUrl.toString();
    }

    return url;
  }

  createPreSignedUrlForPreview(key: string, expiresIn?: number) {
    return this.createPreSignedUrl(key, expiresIn);
  }

  uploadContent(path: string, content: string | Uint8Array) {
    return this.storage.write(path, content, { visibility: 'private' });
  }

  async getFullFileUrl(key?: string | null, expiresIn?: number) {
    if (!key) return '';
    return this.createPreSignedUrl(key, expiresIn ?? this.previewUrlExpiresIn);
  }

  async createUploadPreSignedUrl(key: string, expiresIn = 900) {
    if (!this.usePresignedUploads) return null;
    const command = new PutObjectCommand({ Bucket: fileEnv.S3_BUCKET, Key: key });
    let url = await getSignedUrl(this.client, command, { expiresIn });

    // If using a custom endpoint (e.g., MinIO), replace the host and protocol in the URL
    if (fileEnv.S3_ENDPOINT) {
      const endpoint = new URL(fileEnv.S3_ENDPOINT);
      const signedUrl = new URL(url);
      signedUrl.host = endpoint.host;
      signedUrl.protocol = endpoint.protocol;
      url = signedUrl.toString();
    }

    return url;
  }

  public isPresignedEnabled() {
    return this.usePresignedUploads;
  }
}

export const isPresignedEnabled = () => fileEnv.USE_PRESIGNED_UPLOAD ?? false;

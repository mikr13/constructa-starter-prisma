export interface IFileService {
  createPreSignedUrl(key: string): Promise<string>;
  createPreSignedUrlForPreview(key: string, expiresIn?: number): Promise<string>;
  /** Presigned URL (PUT) for client-side upload; returns null if presigned uploads are disabled. */
  createUploadPreSignedUrl(key: string, expiresIn?: number): Promise<string | null>;
  deleteFile(key: string): Promise<any>;
  deleteFiles(keys: string[]): Promise<any>;
  getFileByteArray(key: string): Promise<Uint8Array>;
  getFileContent(key: string): Promise<string>;
  getFullFileUrl(url?: string | null, expiresIn?: number): Promise<string>;
  /** Accept raw bytes or string when writing */
  uploadContent(path: string, content: string | Uint8Array): Promise<any>;
  /** Whether presigned uploads are enabled */
  isPresignedEnabled(): boolean;
}

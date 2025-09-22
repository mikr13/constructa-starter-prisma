import { create, StoreApi } from 'zustand';
import { File as DbFile } from '@/database/schema/file.schema'; // Assuming File is exported from schema

interface FileState {
  files: DbFile[];
  uploading: boolean;
  error: string | null;
  setFiles: (files: DbFile[]) => void;
  addFile: (file: DbFile) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FileState>((set: StoreApi<FileState>['setState']) => ({
  files: [],
  uploading: false,
  error: null,
  setFiles: (files: DbFile[]) => set({ files, error: null }),
  addFile: (file: DbFile) => set((state) => ({ files: [...state.files, file], error: null })),
  setUploading: (uploading: boolean) => set({ uploading, error: uploading ? null : undefined }), // Clear error when starting upload
  setError: (error: string | null) => set({ error, uploading: false }),
})); 
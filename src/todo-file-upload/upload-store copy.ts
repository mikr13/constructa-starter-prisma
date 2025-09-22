import { create } from "zustand"

interface UploadStoreState {
  /**
   * Files selected in the current upload dialog.
   */
  files: File[]
  setFiles: (files: File[]) => void
  clear: () => void
}

export const useUploadStore = create<UploadStoreState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  clear: () => set({ files: [] })
}))
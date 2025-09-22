import { create } from "zustand"

type Status = "uploading" | "done" | "error"

export interface UploadProgressItem {
  id: string
  name: string
  progress: number // 0-100
  status: Status
}

interface State {
  uploads: Record<string, UploadProgressItem>
  start: (id: string, name: string) => void
  update: (id: string, pct: number) => void
  done: (id: string) => void
  fail: (id: string) => void
  reset: () => void
}

export const useUploadProgress = create<State>()((set) => ({
  uploads: {},
  start: (id, name) =>
    set((s) => ({
      uploads: {
        ...s.uploads,
        [id]: { id, name, progress: 0, status: "uploading" },
      },
    })),
  update: (id, progress) =>
    set((s) => ({
      uploads: {
        ...s.uploads,
        [id]: { ...s.uploads[id], progress },
      },
    })),
  done: (id) =>
    set((s) => ({
      uploads: {
        ...s.uploads,
        [id]: { ...s.uploads[id], progress: 100, status: "done" },
      },
    })),
  fail: (id) =>
    set((s) => ({
      uploads: {
        ...s.uploads,
        [id]: { ...s.uploads[id], status: "error" },
      },
    })),
  reset: () => set({ uploads: {} }),
}))
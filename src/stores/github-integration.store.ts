import { create } from 'zustand';

export const DEFAULT_PROJECT_KEY = '__default__';

export interface GithubIntegrationAccount {
  readonly login: string;
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly htmlUrl?: string;
  readonly scopes: string[];
  readonly connectedAt?: string | null;
  readonly lastSyncedAt?: string | null;
}

export interface GithubIntegrationOrganization {
  readonly id: string;
  readonly login: string;
  readonly name: string;
  readonly type: 'user' | 'organization';
  readonly role?: string;
  readonly avatarUrl?: string;
}

export interface GithubIntegrationRepository {
  readonly id: number;
  readonly name: string;
  readonly fullName: string;
  readonly ownerLogin: string;
  readonly ownerType: 'user' | 'organization';
  readonly private: boolean;
  readonly description?: string | null;
  readonly htmlUrl?: string;
  readonly updatedAt?: string | null;
  readonly pushedAt?: string | null;
  readonly defaultBranch?: string | null;
  readonly language?: string | null;
  readonly archived?: boolean;
  readonly syncEnabled?: boolean;
  readonly lastSyncStartedAt?: string | null;
  readonly lastSyncCompletedAt?: string | null;
}

export interface GithubIntegrationPayload {
  readonly connected: boolean;
  readonly account?: GithubIntegrationAccount;
  readonly organizations: GithubIntegrationOrganization[];
  readonly repositories: GithubIntegrationRepository[];
  readonly scopes?: string[];
  readonly error?: string;
}

type ProjectStatus = 'idle' | 'loading' | 'ready' | 'unauthorized' | 'error';

interface ProjectState {
  status: ProjectStatus;
  data?: GithubIntegrationPayload;
  error: string | null;
  syncing: boolean;
}

interface GithubIntegrationStore {
  projects: Record<string, ProjectState>;
  load: (projectKey?: string | null) => Promise<void>;
  refresh: (projectKey?: string | null) => Promise<void>;
  toggleRepo: (
    projectKey: string | null | undefined,
    repoId: number,
    enable: boolean
  ) => Promise<void>;
  disconnect: () => Promise<void>;
  reset: () => void;
}

export function normalizeProjectKey(projectKey?: string | null): string {
  if (!projectKey) return DEFAULT_PROJECT_KEY;
  const trimmed = projectKey.trim();
  return trimmed.length ? trimmed : DEFAULT_PROJECT_KEY;
}

function buildQuery(projectKey?: string | null): string {
  const key = projectKey?.trim();
  if (!key) return '';
  return `?projectKey=${encodeURIComponent(key)}`;
}

export const useGithubIntegrationStore = create<GithubIntegrationStore>((set, get) => ({
  projects: {},

  load: async (projectKey) => {
    const key = normalizeProjectKey(projectKey);
    set((state) => ({
      projects: {
        ...state.projects,
        [key]: {
          status: 'loading',
          data: state.projects[key]?.data,
          error: null,
          syncing: false,
        },
      },
    }));

    try {
      const res = await fetch(`/api/integrations/github${buildQuery(projectKey)}`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        set((state) => ({
          projects: {
            ...state.projects,
            [key]: {
              status: 'unauthorized',
              data: undefined,
              error: 'Sign in to connect GitHub.',
              syncing: false,
            },
          },
        }));
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message =
          typeof body?.error === 'string' ? body.error : 'Failed to load GitHub integration';
        set((state) => ({
          projects: {
            ...state.projects,
            [key]: {
              status: 'error',
              data: undefined,
              error: message,
              syncing: false,
            },
          },
        }));
        return;
      }

      const payload = (await res.json()) as GithubIntegrationPayload;
      set((state) => ({
        projects: {
          ...state.projects,
          [key]: {
            status: 'ready',
            data: payload,
            error: null,
            syncing: false,
          },
        },
      }));
    } catch (error) {
      set((state) => ({
        projects: {
          ...state.projects,
          [key]: {
            status: 'error',
            data: state.projects[key]?.data,
            error: error instanceof Error ? error.message : 'Failed to load GitHub integration',
            syncing: false,
          },
        },
      }));
    }
  },

  refresh: async (projectKey) => {
    const key = normalizeProjectKey(projectKey);
    set((state) => ({
      projects: {
        ...state.projects,
        [key]: {
          status: state.projects[key]?.status ?? 'idle',
          data: state.projects[key]?.data,
          error: null,
          syncing: true,
        },
      },
    }));

    try {
      const res = await fetch(`/api/integrations/github${buildQuery(projectKey)}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 401) {
        set((state) => ({
          projects: {
            ...state.projects,
            [key]: {
              status: 'unauthorized',
              data: undefined,
              error: 'Sign in to connect GitHub.',
              syncing: false,
            },
          },
        }));
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message =
          typeof body?.error === 'string' ? body.error : 'Failed to refresh GitHub data';
        set((state) => ({
          projects: {
            ...state.projects,
            [key]: {
              status: 'error',
              data: state.projects[key]?.data,
              error: message,
              syncing: false,
            },
          },
        }));
        return;
      }

      await get().load(projectKey);
    } catch (error) {
      set((state) => ({
        projects: {
          ...state.projects,
          [key]: {
            status: state.projects[key]?.status ?? 'error',
            data: state.projects[key]?.data,
            error: error instanceof Error ? error.message : 'Failed to refresh GitHub data',
            syncing: false,
          },
        },
      }));
    }
  },

  toggleRepo: async (projectKey, repoId, enable) => {
    const key = normalizeProjectKey(projectKey);
    if (!Number.isFinite(repoId)) return;

    set((state) => ({
      projects: {
        ...state.projects,
        [key]: {
          status: state.projects[key]?.status ?? 'idle',
          data: state.projects[key]?.data,
          error: null,
          syncing: true,
        },
      },
    }));

    try {
      const res = await fetch('/api/integrations/github', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectKey: projectKey ?? null, repoId, enable }),
      });

      if (res.status === 401) {
        set((state) => ({
          projects: {
            ...state.projects,
            [key]: {
              status: 'unauthorized',
              data: undefined,
              error: 'Sign in to connect GitHub.',
              syncing: false,
            },
          },
        }));
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message =
          typeof body?.error === 'string' ? body.error : 'Failed to update repository sync';
        set((state) => ({
          projects: {
            ...state.projects,
            [key]: {
              status: state.projects[key]?.status ?? 'error',
              data: state.projects[key]?.data,
              error: message,
              syncing: false,
            },
          },
        }));
        return;
      }

      await get().load(projectKey);
    } catch (error) {
      set((state) => ({
        projects: {
          ...state.projects,
          [key]: {
            status: state.projects[key]?.status ?? 'error',
            data: state.projects[key]?.data,
            error: error instanceof Error ? error.message : 'Failed to update repository sync',
            syncing: false,
          },
        },
      }));
    }
  },

  disconnect: async () => {
    try {
      const res = await fetch('/api/integrations/github', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok && res.status !== 401 && res.status !== 404) {
        const body = await res.json().catch(() => ({}));
        const message =
          typeof body?.error === 'string' ? body.error : 'Failed to disconnect GitHub';
        set((state) => ({
          projects: Object.fromEntries(
            Object.entries(state.projects).map(([key, value]) => [
              key,
              {
                ...value,
                error: message,
                syncing: false,
              },
            ])
          ),
        }));
        return;
      }
    } finally {
      set({ projects: {} });
    }
  },

  reset: () => set({ projects: {} }),
}));

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import { logger } from '~/lib/logger';
import { useSession } from '~/lib/auth-client';
import {
  defaultSettingsSection,
  isSettingsSection,
  type SettingsSection,
} from '../settings-nav';
import {
  SettingsLayout,
  GeneralSettings,
  PreferencesSettings,
  GithubSettings,
  GithubConnectionCard,
  GithubAccountCard,
  GithubRepoBrowser,
} from './index';
import {
  useGithubIntegrationStore,
  normalizeProjectKey,
  type GithubIntegrationOrganization,
} from '~/lib/stores/github-integration.store';

interface GithubOrgOption {
  readonly id: string;
  readonly label: string;
  readonly type: 'personal' | 'organization';
  readonly description?: string;
  readonly badge?: string;
  readonly ownerLogin: string;
}

const GITHUB_DOCS_URL = 'https://docs.github.com/en/apps/using-github-apps/installing-github-apps';

const DEFAULT_PROJECT_STATE = Object.freeze({
  status: 'idle' as const,
  data: undefined,
  error: null,
  syncing: false,
});

interface SettingsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [githubSearch, setGithubSearch] = useState('');
  const [githubActiveOrg, setGithubActiveOrg] = useState<'personal' | string>('personal');
  const { data: session } = useSession();

  const projectKey = normalizeProjectKey(projectId);
  const projectState = useGithubIntegrationStore(
    (state) => state.projects[projectKey] ?? DEFAULT_PROJECT_STATE
  );
  const loadGithub = useGithubIntegrationStore((state) => state.load);
  const refreshGithub = useGithubIntegrationStore((state) => state.refresh);
  const toggleGithubRepo = useGithubIntegrationStore((state) => state.toggleRepo);
  const disconnectGithub = useGithubIntegrationStore((state) => state.disconnect);
  const resetGithubStore = useGithubIntegrationStore((state) => state.reset);
  const lastResetUserRef = useRef<string | null>(null);

  const location = useRouterState({ select: (state) => state.location });
  const search = location.search as Record<string, unknown>;
  const activeSection: SettingsSection = (() => {
    const value = (search as { settings?: unknown }).settings;
    return isSettingsSection(value) ? value : defaultSettingsSection;
  })();

  const githubStatus = projectState.status;
  const githubLoading = githubStatus === 'loading';
  const githubSyncing = projectState.syncing || githubStatus === 'loading';
  const githubData = projectState.data;
  const githubErrorForState = projectState.error;

  const isGithubConnected = Boolean(githubData?.connected);
  const connectedGithubAccount = githubData?.account ?? null;
  const githubOrganizations: GithubIntegrationOrganization[] = githubData?.connected
    ? githubData.organizations
    : [];

  const githubOrgOptions = useMemo<GithubOrgOption[]>(() => {
    if (!githubOrganizations.length) return [];
    return githubOrganizations.map((org) => {
      const isPersonal = org.type === 'user';
      return {
        id: isPersonal ? 'personal' : org.id,
        label: isPersonal ? `${org.name} (Personal)` : org.name || org.login,
        type: isPersonal ? 'personal' : 'organization',
        description: isPersonal
          ? 'Access private and public repositories you own.'
          : `GitHub organization • ${org.login}`,
        badge: org.role ? org.role[0]?.toUpperCase() + org.role.slice(1) : undefined,
        ownerLogin: org.login,
      };
    });
  }, [githubOrganizations]);

  const githubActiveOwnerLogin = useMemo(() => {
    if (!githubOrgOptions.length) return '';
    const selected = githubOrgOptions.find((option) => option.id === githubActiveOrg);
    return selected?.ownerLogin ?? githubOrgOptions[0]?.ownerLogin ?? '';
  }, [githubOrgOptions, githubActiveOrg]);

  const githubScopedRepos = useMemo(() => {
    if (!githubData?.connected) return [];
    const repos = githubData.repositories ?? [];
    if (!githubActiveOwnerLogin) return repos;
    return repos.filter((repo) => repo.ownerLogin === githubActiveOwnerLogin);
  }, [githubData, githubActiveOwnerLogin]);

  const githubFilteredRepos = useMemo(() => {
    if (!githubScopedRepos.length) return [];
    const query = githubSearch.trim().toLowerCase();
    if (!query) return githubScopedRepos;
    return githubScopedRepos.filter((repo) => {
      const haystack = `${repo.ownerLogin}/${repo.name}`.toLowerCase();
      const description = repo.description?.toLowerCase() ?? '';
      return haystack.includes(query) || description.includes(query);
    });
  }, [githubScopedRepos, githubSearch]);

  const githubError = useMemo(() => {
    if (githubStatus === 'unauthorized' && !session?.user) {
      return 'Sign in to connect GitHub.';
    }
    return githubErrorForState;
  }, [githubStatus, githubErrorForState, session?.user]);

  // Resolve current projectId from session
  useEffect(() => {
    if (!open) return;
    try {
      const last =
        typeof window !== 'undefined' ? window.sessionStorage.getItem('codefetch_lastJobId') : null;
      setProjectId(last && last.trim() ? last.trim() : null);
    } catch {
      setProjectId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const userId = session?.user?.id ?? null;
    if (lastResetUserRef.current === userId) return;
    resetGithubStore();
    lastResetUserRef.current = userId;
  }, [open, resetGithubStore, session?.user?.id]);

  useEffect(() => {
    if (!open) {
      setGithubSearch('');
      setGithubActiveOrg('personal');
    }
  }, [open]);

  useEffect(() => {
    if (!open || activeSection !== 'github') return;
    if (githubStatus === 'idle' || githubStatus === 'error') {
      void loadGithub(projectId);
    }
  }, [open, activeSection, githubStatus, loadGithub, projectId]);

  useEffect(() => {
    if (!githubData?.connected) return;
    if (!githubOrgOptions.length) return;
    setGithubActiveOrg((prev) => {
      if (githubOrgOptions.some((option) => option.id === prev)) {
        return prev;
      }
      return githubOrgOptions[0]?.id ?? 'personal';
    });
  }, [githubData, githubOrgOptions]);

  const handleGithubConnect = useCallback(async () => {
    try {
      const stateValue =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const returnTo = `${origin}/?settings=github&github=connected`;
      const redirectUri = `${origin}/api/git/oauth/github?action=callback&return_to=${encodeURIComponent(returnTo)}&state=${encodeURIComponent(stateValue)}`;
      const authorizeRes = await fetch(
        `/api/git/oauth/github?action=authorize&state=${encodeURIComponent(stateValue)}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        { credentials: 'include' }
      );
      if (!authorizeRes.ok) {
        const body = await authorizeRes.json().catch(() => ({}));
        const message =
          typeof (body as any)?.error === 'string' ? (body as any).error : 'Failed to start GitHub OAuth';
        throw new Error(message);
      }
      const body = (await authorizeRes.json()) as { url?: string };
      if (!body?.url) {
        throw new Error('GitHub authorization URL was not provided');
      }
      if (typeof window !== 'undefined') {
        window.location.href = body.url;
      }
    } catch (error) {
      useGithubIntegrationStore.setState((state) => ({
        projects: {
          ...state.projects,
          [projectKey]: {
            status: state.projects[projectKey]?.status ?? 'error',
            data: state.projects[projectKey]?.data,
            error: error instanceof Error ? error.message : 'Unable to connect to GitHub',
            syncing: false,
          },
        },
      }));
    }
  }, [projectKey]);

  const handleGithubDisconnect = useCallback(async () => {
    await disconnectGithub();
    setGithubActiveOrg('personal');
    await loadGithub(projectId);
  }, [disconnectGithub, loadGithub, projectId]);

  const handleGithubManage = useCallback(async () => {
    if (!isGithubConnected) {
      await loadGithub(projectId);
      return;
    }
    await refreshGithub(projectId);
  }, [isGithubConnected, refreshGithub, loadGithub, projectId]);

  const handleGithubToggleRepo = useCallback(
    async (repoId: number, enable: boolean) => {
      await toggleGithubRepo(projectId, repoId, enable);
    },
    [projectId, toggleGithubRepo]
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings projectId={projectId} />;
      case 'preferences':
        return <PreferencesSettings projectId={projectId} />;
      case 'github':
        return (
          <GithubSettings>
            <GithubConnectionCard
              isConnected={isGithubConnected}
              loading={githubLoading}
              syncing={githubSyncing}
              docsUrl={GITHUB_DOCS_URL}
              onConnect={handleGithubConnect}
              onDisconnect={handleGithubDisconnect}
              onManage={isGithubConnected ? handleGithubManage : undefined}
              error={githubError}
              account={connectedGithubAccount}
              organizationCount={githubOrganizations.length}
              unauthorized={githubStatus === 'unauthorized' && !session?.user}
            />
            <GithubAccountCard
              isConnected={isGithubConnected}
              account={connectedGithubAccount}
              options={githubOrgOptions}
              activeOrgId={githubActiveOrg}
              onOrgChange={setGithubActiveOrg}
            />
            <GithubRepoBrowser
              isConnected={isGithubConnected}
              loading={githubLoading || githubSyncing}
              repos={githubFilteredRepos}
              search={githubSearch}
              totalInScope={githubScopedRepos.length}
              onSearchChange={setGithubSearch}
              onToggleRepo={handleGithubToggleRepo}
              syncing={githubSyncing}
              unauthorized={githubStatus === 'unauthorized' && !session?.user}
            />
          </GithubSettings>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[1100px] w-[95dvw] max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">Project and chat settings</DialogDescription>
        <SettingsLayout activeSection={activeSection}>
          {renderContent()}
        </SettingsLayout>
      </DialogContent>
    </Dialog>
  );
}
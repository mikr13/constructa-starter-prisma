import { Search, Lock, Globe2 } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import { SettingsCard } from '../../shared/SettingsCard';
import type { GithubIntegrationRepository } from '~/stores/github-integration.store';

interface GithubRepoBrowserProps {
  readonly isConnected: boolean;
  readonly loading: boolean;
  readonly repos: GithubIntegrationRepository[];
  readonly search: string;
  readonly totalInScope: number;
  readonly onSearchChange: (value: string) => void;
  readonly onToggleRepo: (repoId: number, enable: boolean) => void;
  readonly syncing: boolean;
  readonly unauthorized: boolean;
}

const REPO_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function GithubRepoBrowser({
  isConnected,
  loading,
  repos,
  search,
  totalInScope,
  onSearchChange,
  onToggleRepo,
  syncing,
  unauthorized,
}: GithubRepoBrowserProps) {
  if (unauthorized) {
    return (
      <div className="space-y-4">
        <h3 className="px-1 text-sm font-medium text-gray-900 dark:text-gray-100">Repositories</h3>
        <SettingsCard
          icon={<Search className="h-4 w-4" />}
          description="Sign in to view and manage GitHub repositories for this project."
        />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <h3 className="px-1 text-sm font-medium text-gray-900 dark:text-gray-100">Repositories</h3>
        <SettingsCard
          icon={<Search className="h-4 w-4" />}
          title="GitHub Repositories"
          description="Connect GitHub to browse organizations and search repositories before syncing."
        >
          <div />
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="px-1 text-sm font-medium text-gray-900 dark:text-gray-100">Repositories</h3>
      <SettingsCard
        icon={<Search className="h-4 w-4" />}
        title="Search repositories"
        description="Search GitHub repositories within the selected scope. We'll sync only what you approve."
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search repositories"
                className="pl-9"
                aria-label="Search GitHub repositories"
                disabled={loading || syncing}
              />
            </div>
            <p className="text-xs text-muted-foreground md:ml-auto">
              Showing {repos.length} of {totalInScope} repositories in scope
            </p>
          </div>

          <div className="rounded-md border border-border-subtle bg-muted/20">
            {loading ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">Loading repositories…</div>
            ) : repos.length ? (
              <ScrollArea className="max-h-80">
                <ul className="divide-y divide-border-subtle">
                  {repos.map((repo) => {
                    const updatedLabel = repo.updatedAt
                      ? REPO_DATE_FORMATTER.format(new Date(repo.updatedAt))
                      : 'Not synced yet';
                    const syncLabel = repo.lastSyncCompletedAt
                      ? `Last synced ${REPO_DATE_FORMATTER.format(new Date(repo.lastSyncCompletedAt))}`
                      : repo.syncEnabled
                        ? 'Sync enabled, awaiting first run'
                        : 'Sync disabled';

                    return (
                      <li key={repo.id} className="flex flex-col gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {repo.fullName || `${repo.ownerLogin}/${repo.name}`}
                            </span>
                            <Badge
                              variant={repo.private ? 'secondary' : 'outline'}
                              className="flex items-center gap-1"
                            >
                              {repo.private ? (
                                <Lock className="h-3 w-3" aria-hidden="true" />
                              ) : (
                                <Globe2 className="h-3 w-3" aria-hidden="true" />
                              )}
                              {repo.private ? 'Private' : 'Public'}
                            </Badge>
                            <Badge
                              variant={repo.syncEnabled ? 'secondary' : 'outline'}
                              className="flex items-center gap-1"
                            >
                              {repo.syncEnabled ? 'Sync enabled' : 'Sync off'}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant={repo.syncEnabled ? 'outline' : 'default'}
                            disabled={loading || syncing}
                            onClick={() => onToggleRepo(repo.id, !repo.syncEnabled)}
                          >
                            {repo.syncEnabled ? 'Disable Sync' : 'Enable Sync'}
                          </Button>
                        </div>
                        {repo.description ? (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {repo.description}
                          </p>
                        ) : null}
                        <p className="text-xs text-muted-foreground">Updated {updatedLabel}</p>
                        <p className="text-xs text-muted-foreground">{syncLabel}</p>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            ) : (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                No repositories found for the selected scope. Update your GitHub permissions if you
                expected more results.
              </div>
            )}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

import { Github, Plug, RefreshCw, ShieldAlert, ChevronDown } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { SettingsCard } from '../../shared/SettingsCard';
import type { GithubIntegrationAccount } from '~/lib/stores/github-integration.store';

function GreenDot() {
  return <div className="w-2 h-2 bg-green-500 rounded-full" />;
}

interface GithubConnectionCardProps {
  readonly isConnected: boolean;
  readonly loading: boolean;
  readonly syncing: boolean;
  readonly docsUrl: string;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
  readonly onManage?: () => void;
  readonly error: string | null;
  readonly account: GithubIntegrationAccount | null;
  readonly organizationCount: number;
  readonly unauthorized: boolean;
}

export function GithubConnectionCard({
  isConnected,
  loading,
  syncing,
  unauthorized,
  docsUrl,
  onConnect,
  onDisconnect,
  onManage,
  error,
  account,
  organizationCount,
}: GithubConnectionCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="px-1 text-sm font-medium text-gray-900 dark:text-gray-100">GitHub</h3>
      <SettingsCard
        icon={<Github className="h-4 w-4" />}
        title={<div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="flex items-center gap-1">
            {isConnected && <GreenDot />}
            {isConnected ? 'Connected' : 'Not connected'}
          </Badge>
        </div>}
        description={
          unauthorized
            ? 'Sign in to your Codefetch account to enable GitHub sync.'
            : loading
              ? 'Contacting GitHub to fetch your account details…'
              : syncing
                ? 'Refreshing repository catalog from GitHub…'
                : isConnected
                  ? 'GitHub is connected. Refresh repositories or switch organizations below.'
                  : 'Connect your project to your GitHub organization in a 2-way sync.'
        }
      >
        <div className="flex flex-col gap-2">
          {isConnected && account && (
            <p className="text-xs text-muted-foreground">
              {organizationCount > 0
                ? `${organizationCount} organization${organizationCount === 1 ? '' : 's'} available for sync.`
                : 'No organizations granted yet—use GitHub to install the app where needed.'}
            </p>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={loading || syncing || unauthorized}>
                    Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onManage && (
                    <DropdownMenuItem onClick={onManage}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Repos
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onDisconnect}>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={onConnect} disabled={loading || unauthorized}>
                <Plug className="mr-2 h-4 w-4" />
                Connect Project
              </Button>
            )}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
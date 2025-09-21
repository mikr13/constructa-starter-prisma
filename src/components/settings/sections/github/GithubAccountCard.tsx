import { UserCircle, Building2 } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { SettingsCard } from '../../shared/SettingsCard';
import type { GithubIntegrationAccount } from '~/stores/github-integration.store';

interface GithubOrgOption {
  readonly id: string;
  readonly label: string;
  readonly type: 'personal' | 'organization';
  readonly description?: string;
  readonly badge?: string;
  readonly ownerLogin: string;
}

interface GithubAccountCardProps {
  readonly isConnected: boolean;
  readonly account: GithubIntegrationAccount | null;
  readonly options: GithubOrgOption[];
  readonly activeOrgId: string;
  readonly onOrgChange: (value: 'personal' | string) => void;
}

export function GithubAccountCard({
  isConnected,
  account,
  options,
  activeOrgId,
  onOrgChange,
}: GithubAccountCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="px-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        Account & Organizations
      </h3>
      {isConnected && account ? (
        <SettingsCard
          icon={<UserCircle className="h-4 w-4" />}
          title={
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Signed in as</span>
              <Badge variant="secondary">{account.displayName ?? account.login}</Badge>
            </div>
          }
          description="Manage connected organizations and toggle repository scope."
        >
          <div className="space-y-2">
            {account.htmlUrl && (
              <a
                href={account.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground underline block"
              >
                View profile on GitHub
              </a>
            )}
            {account.scopes?.length && (
              <p className="text-xs text-muted-foreground">Scopes: {account.scopes.join(', ')}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="github-org-select">Repository scope</Label>
              <Select
                value={activeOrgId}
                onValueChange={(value) => onOrgChange(value as 'personal' | string)}
              >
                <SelectTrigger id="github-org-select">
                  <SelectValue placeholder="Select GitHub scope" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className="flex items-start gap-2 py-2"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {option.type === 'personal' ? (
                          <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-sm font-medium truncate">{option.label}</span>
                          <div className="flex items-center gap-2">
                            {option.description && (
                              <span className="text-xs text-muted-foreground truncate">
                                {option.description}
                              </span>
                            )}
                            {option.badge && (
                              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                {option.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsCard>
      ) : (
        <SettingsCard
          icon={<UserCircle className="h-4 w-4" />}
          title="GitHub Account"
          description="Connect GitHub to choose between personal repositories and organizations you manage."
        >
          <div />
        </SettingsCard>
      )}
    </div>
  );
}

import { Link } from '@tanstack/react-router';
import { cn } from '~/lib/utils';
import { SidebarMenuButton, SidebarMenuItem } from '~/components/ui/sidebar';
import RiGithubFill from '~icons/ri/github-fill';
import RiListSettingsLine from '~icons/ri/list-settings-line';
import RiUserSettingsLine from '~icons/ri/user-settings-line';
import { settingsNavItems, type SettingsNavItem, type SettingsSection } from './settings-nav';

interface SettingsNavigationProps {
  readonly activeSection: SettingsSection;
}

export function SettingsNavigation({ activeSection }: SettingsNavigationProps) {
  const workspaceItems = settingsNavItems.filter((item) => item.section !== 'github');
  const connectionItems = settingsNavItems.filter((item) => item.section === 'github');

  const renderNavItem = (item: SettingsNavItem) => {
    const isActive = item.section === activeSection;

    return (
      <SidebarMenuItem key={item.section}>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link
            to="."
            search={(prev) => {
              const next = { ...prev } as Record<string, unknown>;
              next.settings = item.section;
              return next;
            }}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              {item.icon === 'ri:user-settings-line' && <RiUserSettingsLine className="h-4 w-4" />}
              {item.icon === 'ri:github-fill' && <RiGithubFill className="h-4 w-4" />}
              {item.icon === 'ri:list-settings-line' && <RiListSettingsLine className="h-4 w-4" />}
              <span className="font-medium leading-none">{item.label}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <div className="flex flex-col gap-6 px-2 py-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2">
          Workspace
        </p>
        <div className="space-y-1">{workspaceItems.map(renderNavItem)}</div>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarProvider,
} from '~/components/ui/sidebar';
import { SettingsNavigation } from './SettingsNavigation';
import { SettingsContent } from './SettingsContent';
import type { SettingsSection } from './settings-nav';

interface SettingsLayoutProps {
  readonly activeSection: SettingsSection;
  readonly children: ReactNode;
}

export function SettingsLayout({ activeSection, children }: SettingsLayoutProps) {
  return (
    <SidebarProvider className="items-start">
      <Sidebar collapsible="none" className="hidden md:flex">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SettingsNavigation activeSection={activeSection} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SettingsContent activeSection={activeSection}>
        {children}
      </SettingsContent>
    </SidebarProvider>
  );
}

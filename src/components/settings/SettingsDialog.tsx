import { AccountView } from '@daveyplate/better-auth-ui';
import { useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { accountViewClassNames } from '~/components/auth/auth-styles';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '~/components/ui/dialog';
import { useSession } from '~/hooks/auth-hooks';
import { GeneralSettings, PreferencesSettings, SettingsLayout } from './index';
import { type SettingsSection, defaultSettingsSection, isSettingsSection } from './settings-nav';

interface SettingsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const { data: session } = useSession();

  const location = useRouterState({ select: (state) => state.location });
  const search = location.search as Record<string, unknown>;
  const rawSettings = (search as { settings?: unknown }).settings;
  const activeSection: SettingsSection = isSettingsSection(rawSettings)
    ? rawSettings
    : defaultSettingsSection;

  // Resolve current projectId from session
  useEffect(() => {
    if (!open) return;
    try {
      const last =
        typeof window !== 'undefined' ? window.sessionStorage.getItem('codefetch_lastJobId') : null;
      setProjectId(last?.trim() ? last.trim() : null);
    } catch {
      setProjectId(null);
    }
  }, [open]);

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountView hideNav classNames={accountViewClassNames} />;
      case 'general':
        return <GeneralSettings projectId={projectId} />;
      case 'preferences':
        return <PreferencesSettings projectId={projectId} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[1100px] w-[95dvw] max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">Project and chat settings</DialogDescription>
        <SettingsLayout activeSection={activeSection}>{renderContent()}</SettingsLayout>
      </DialogContent>
    </Dialog>
  );
}

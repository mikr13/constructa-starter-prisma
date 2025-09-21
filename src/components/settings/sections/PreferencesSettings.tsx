import { useCallback } from 'react';
import { useTheme } from '~/components/theme-provider';
import { logger } from '~/lib/logger';
import { SettingsCard } from '../shared/SettingsCard';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';

interface PreferencesSettingsProps {
  readonly projectId?: string | null;
}

export function PreferencesSettings({ projectId }: PreferencesSettingsProps) {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = useCallback(
    (newTheme: 'light' | 'dark' | 'system') => {
      logger.debug('PreferencesSettings.themeChange', { theme: newTheme });
      setTheme(newTheme);
    },
    [setTheme]
  );

  const getThemeIcon = (themeOption: 'light' | 'dark' | 'system') => {
    switch (themeOption) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeDescription = (themeOption: 'light' | 'dark' | 'system') => {
    switch (themeOption) {
      case 'light':
        return 'Bright and clean interface';
      case 'dark':
        return 'Easy on the eyes in low light';
      case 'system':
        return 'Follow your system preference';
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        icon={<Palette className="h-5 w-5" />}
        title="Interface & Theme"
        description="Customize the appearance of your Codefetch interface"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="text-sm font-medium">Theme</div>
            <div className="grid gap-2">
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <label
                  key={themeOption}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="theme"
                    className="sr-only"
                    checked={theme === themeOption}
                    onChange={() => handleThemeChange(themeOption)}
                  />
                  <div className={`flex items-center justify-center w-8 h-8 rounded-md border ${theme === themeOption ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground'}`}>
                    {getThemeIcon(themeOption)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium capitalize">{themeOption}</div>
                    <div className="text-sm text-muted-foreground">
                      {getThemeDescription(themeOption)}
                    </div>
                  </div>
                  {theme === themeOption && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`flex items-center justify-center w-10 h-10 rounded-md bg-background border`}>
                {getThemeIcon(theme)}
              </div>
              <div>
                <div className="font-medium">Current Theme</div>
                <div className="text-sm text-muted-foreground">
                  {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'} mode
                </div>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
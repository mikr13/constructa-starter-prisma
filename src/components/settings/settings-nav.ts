export const settingsNavItems = [
  {
    section: 'account',
    label: 'Account',
    description: 'Manage profile details and security credentials.',
    icon: 'ri:user-settings-line',
  },
  {
    section: 'preferences',
    label: 'Preferences',
    description: 'Interface and theme settings.',
    icon: 'ri:list-settings-line',
  },
] as const;

export type SettingsNavItem = (typeof settingsNavItems)[number];
export type SettingsSection = SettingsNavItem['section'];
export const defaultSettingsSection: SettingsSection = 'general';

export function isSettingsSection(value: unknown): value is SettingsSection {
  return settingsNavItems.some((item) => item.section === value);
}

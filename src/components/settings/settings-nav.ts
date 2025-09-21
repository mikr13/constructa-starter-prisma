export const settingsNavItems = [
  {
    section: 'account',
    label: 'Account',
    description: 'Manage profile details and security credentials.',
    icon: 'ri:user-settings-line',
  },
  {
    section: 'general',
    label: 'General',
    description: 'Project preferences and privacy controls.',
    icon: 'ri:settings-4-line',
  },
  {
    section: 'preferences',
    label: 'Preferences',
    description: 'Interface and theme settings.',
    icon: 'ri:list-settings-line',
  },
  {
    section: 'github',
    label: 'GitHub',
    description: 'Connect your project to GitHub for 2-way sync.',
    icon: 'ri:github-fill',
  },
] as const;

export type SettingsNavItem = (typeof settingsNavItems)[number];
export type SettingsSection = SettingsNavItem['section'];
export const defaultSettingsSection: SettingsSection = 'general';

export function isSettingsSection(value: unknown): value is SettingsSection {
  return settingsNavItems.some((item) => item.section === value);
}

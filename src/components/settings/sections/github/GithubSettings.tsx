import type { ReactNode } from 'react';

interface GithubSettingsProps {
  readonly children: ReactNode;
}

export function GithubSettings({ children }: GithubSettingsProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      {children}
    </div>
  );
}
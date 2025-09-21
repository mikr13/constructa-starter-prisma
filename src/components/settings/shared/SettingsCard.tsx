import type { ReactNode } from 'react';
import { Card, CardContent } from '~/components/ui/card';

interface SettingsCardProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function SettingsCard({ icon, title, description, children, className }: SettingsCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-muted size-10 shrink-0 items-center justify-center rounded-md">
            {icon}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium">{title}</p>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
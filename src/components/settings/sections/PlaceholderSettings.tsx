interface PlaceholderSettingsProps {
  readonly title: string;
  readonly description: string;
}

export function PlaceholderSettings({ title, description }: PlaceholderSettingsProps) {
  return (
    <section className="space-y-3 max-w-2xl">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="rounded-lg border border-dashed border-border-subtle bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
        This section is coming soon.
      </div>
    </section>
  );
}
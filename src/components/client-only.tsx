import React from 'react';

/**
 * TanStack Start - ClientOnly Component
 *
 * Renders components only on client to prevent SSR hydration errors.
 * Uses `fallback` prop for loading states.
 *
 * @example
 * ```tsx
 * <ClientOnly fallback={<div>Loading...</div>}>
 *   <ModeToggle />
 * </ClientOnly>
 * ```
 */
export function ClientOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

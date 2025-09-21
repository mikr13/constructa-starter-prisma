import { AuthView, authLocalization } from '@daveyplate/better-auth-ui';
import { redirect, createFileRoute, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getSession } from '~/server/function/auth.server.func';
import { authLocalizationOverrides, authViewClassNames } from '~/components/auth/auth-styles';

const searchSchema = z.object({
  redirect: z.string().optional(),
  token: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute('/auth/$pathname')({
  validateSearch: searchSchema,
  component: RouteComponent,
  beforeLoad: async ({ params }: { params: { pathname: string } }) => {
    // Only check session for sign‑in and sign‑up routes
    if (params.pathname === 'sign-in' || params.pathname === 'sign-up') {
      const session = await getSession();
      if (session?.user) {
        // User is already logged in, redirect to dashboard
        throw redirect({
          to: '/dashboard',
        });
      }
    }
  },
});

function RouteComponent() {
  const { pathname } = Route.useParams();
  const { redirect, message } = Route.useSearch();
  const redirectTo = redirect || '/dashboard';
  const localizedCopy = {
    ...authLocalization,
    ...authLocalizationOverrides,
    ...(pathname === 'sign-in' && message === 'password-reset-sent'
      ? { SIGN_IN_DESCRIPTION: 'Check your email for the password reset link.' }
      : {}),
  };

  return (
    <main className="flex grow flex-col items-center justify-center gap-4 bg-background p-4">
      <AuthView
        classNames={authViewClassNames}
        localization={localizedCopy}
        pathname={pathname}
        redirectTo={redirectTo}
      />
    </main>
  );
}

import {  redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { SignInForm } from '~/components/auth/sign-in-form';
import { SignUpForm } from '~/components/auth/sign-up-form';
import { getSession } from '~/server/function/auth.server.func';
import {
  authContainerClassName,
  authHeaderClassName,
  authTitleClassName,
  authDescriptionClassName,
  authCardLocalization,
} from '~/components/auth/auth-styles';

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute({
  validateSearch: searchSchema,
  component: RouteComponent,
  beforeLoad: async ({ params }: { params: { pathname: string } }) => {
    // Only check session for sign-in and sign-up routes
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
  const { redirect } = Route.useSearch();
  const redirectTo = redirect || '/dashboard';

  const renderAuthForm = () => {
    switch (pathname) {
      case 'sign-in':
        return (
          <div className={authContainerClassName}>
            <div className="px-8 pt-8">
              <div className={authHeaderClassName}>
                <h1 className={authTitleClassName}>
                  {authCardLocalization.SIGN_IN}
                </h1>
                <p className={authDescriptionClassName}>
                  {authCardLocalization.SIGN_IN_DESCRIPTION}
                </p>
              </div>
            </div>
            <div className="px-8 pb-8">
              <SignInForm redirectTo={redirectTo} localization={authCardLocalization} />
            </div>
          </div>
        );
      
      case 'sign-up':
        return (
          <div className={authContainerClassName}>
            <div className="px-8 pt-8">
              <div className={authHeaderClassName}>
                <h1 className={authTitleClassName}>
                  {authCardLocalization.SIGN_UP}
                </h1>
                <p className={authDescriptionClassName}>
                  {authCardLocalization.SIGN_UP_DESCRIPTION}
                </p>
              </div>
            </div>
            <div className="px-8 pb-8">
              <SignUpForm redirectTo={redirectTo} localization={authCardLocalization} />
            </div>
          </div>
        );
      
      // TODO: Add cases for other auth routes like forgot-password, reset-password, etc.
      default:
        return (
          <div className={authContainerClassName}>
            <div className="p-8">
              <div className={authHeaderClassName}>
                <h1 className={authTitleClassName}>
                  Page not found
                </h1>
                <p className={authDescriptionClassName}>
                  The authentication page you're looking for doesn't exist.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex grow flex-col items-center justify-center gap-4 p-4 bg-orange-50">
      {renderAuthForm()}
    </main>
  );
}

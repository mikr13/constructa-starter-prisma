import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmail } from '~/components/auth/verify-email'

export const Route = createFileRoute('/auth/verify-email')({
  validateSearch: (search) => ({
    token: (search as any).token as string | undefined,
    email: (search as any).email as string | undefined,
  }),
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { token, email } = Route.useSearch()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <VerifyEmail email={email} token={token} />
      </div>
    </div>
  )
}
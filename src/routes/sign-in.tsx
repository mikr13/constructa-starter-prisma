import { Link } from "@tanstack/react-router"
import { SignInForm } from "~/components/auth/sign-in-form"

export const Route = createFileRoute({
    component: SignInPage
})

function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-6">
                <SignInForm />
                <p className="text-center text-muted-foreground text-sm">
                    Don't have an account?{" "}
                    <Link to="/sign-up" className="font-medium text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

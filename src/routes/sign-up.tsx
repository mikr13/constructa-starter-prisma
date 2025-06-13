import { Link } from "@tanstack/react-router"
import { SignUpForm } from "~/components/auth/sign-up-form"

export const Route = createFileRoute({
    component: SignUpPage
})

function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-6">
                <SignUpForm />
                <p className="text-center text-muted-foreground text-sm">
                    Already have an account?{" "}
                    <Link to="/sign-in" className="font-medium text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

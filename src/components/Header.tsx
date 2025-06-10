import { Link } from "@tanstack/react-router"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"
import { useAuth } from "./auth/auth-provider"
import { signOut } from "~/lib/auth-client"

export function Header() {
    const { isAuthenticated, user } = useAuth()

    const handleSignOut = async () => {
        await signOut()
        window.location.href = "/"
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-background/60 px-4 py-3 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
                <Link to="/" className="font-bold text-2xl text-foreground">
                    ex0
                </Link>

                <nav className="flex items-center gap-6">
                    <Link 
                        to="/docs" 
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Docs
                    </Link>
                    <a 
                        href="https://github.com/instructa/constructa-starter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                        GitHub
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                    <ModeToggle />
                    
                    {!isAuthenticated ? (
                        <Link to="/sign-in">
                            <Button className="rounded-full bg-primary px-6 font-medium text-primary-foreground text-sm hover:bg-primary/90">
                                Sign In
                            </Button>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                Welcome, {user?.name || user?.email}
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}

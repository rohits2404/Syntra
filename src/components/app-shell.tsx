import { auth } from "@/lib/auth";
import Link from "next/link";
import { NavPlanUsage } from "./billing/nav-plan-usage";
import { ThemeToggle } from "./theme-toggle";
import { SignOutButton } from "./auth/sign-out-button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export async function AppShell({ children }: { children: React.ReactNode }) {
    const session = await auth();

    return (
        <div className="app-shell relative flex min-h-svh flex-col">
            <div
                className="app-shell-glow pointer-events-none absolute inset-0"
                aria-hidden
            />
            <header className="app-header sticky top-0 z-40 border-b border-(--app-line)">
                <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
                    <div className="flex min-w-0 items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="app-brand inline-flex items-center gap-2.5"
                        >
                            <span className="flex size-7 items-center justify-center rounded-full bg-(--app-accent)/15 ring-1 ring-(--app-accent)/35">
                                <span className="size-2 rounded-full bg-(--app-accent)" />
                            </span>
                            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                                Syntra - AI Codebase Auditor
                            </span>
                        </Link>
                        <nav className="flex items-center gap-1">
                            <Link href="/dashboard" className="app-nav-link">
                                Projects
                            </Link>
                            <Link href="/projects/new" className="app-nav-link">
                                Analyze
                            </Link>
                            <Link href="/settings" className="app-nav-link">
                                Settings
                            </Link>
                        </nav>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {session?.user?.id ? (
                            <NavPlanUsage userId={session.user.id} />
                        ) : null}
                        <ThemeToggle />
                        <SignOutButton />
                        <Link
                            href="/projects/new"
                            className={cn(
                                buttonVariants({ size: "sm" }),
                                "hidden bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white shadow-none hover:opacity-90 md:inline-flex",
                            )}
                        >
                            New Analysis
                        </Link>
                    </div>
                </div>
            </header>

            <div className="relative z-10 flex-1">{children}</div>
        </div>
    );
}

import { RepoPicker } from "@/components/projects/repo-picker";
import { ZipUploadForm } from "@/components/projects/zip-upload-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { connectGitHubAccount } from "@/lib/actions/github";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listGitHubRepos } from "@/lib/github";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const NewProjectsPage = async () => {
    const session = await auth();
    if (!session?.user) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            githubAccessToken: true,
            githubUsername: true,
        },
    });

    const githubConnected = Boolean(user?.githubAccessToken);
    let repos: Awaited<ReturnType<typeof listGitHubRepos>> = [];
    let repoError: string | null = null;

    if (user?.githubAccessToken) {
        try {
            repos = await listGitHubRepos(user.githubAccessToken);
        } catch (error) {
            repoError =
                error instanceof Error
                    ? error.message
                    : "Failed To Load GitHub Repositories.";
        }
    }

    return (
        <main className="app-page app-page-narrow">
            <header className="mb-8">
                <p className="app-kicker">New Analysis</p>
                <h1 className="app-title mt-2 text-3xl">
                    Analyze a Repository
                </h1>
                <p className="mt-2 text-sm text-(--app-muted)">
                    Connect GitHub or Upload a ZIP Of Your Project.
                </p>
            </header>

            <section className="app-panel space-y-4 p-6">
                <div>
                    <h2 className="app-title text-lg">GitHub</h2>
                    <p className="mt-1 text-sm text-(--app-muted)">
                        {githubConnected
                            ? `Connected As ${user?.githubUsername ?? "GitHub"}`
                            : "Connect GitHub First To Select a Repository."}
                    </p>
                </div>
                {!githubConnected ? (
                    <form action={connectGitHubAccount}>
                        <Button
                            type="submit"
                            className="bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
                        >
                            Connect GitHub
                        </Button>
                    </form>
                ) : repoError ? (
                    <div className="space-y-3">
                        <p className="text-sm text-destructive">{repoError}</p>
                        <Link
                            href="/settings"
                            className={cn(
                                buttonVariants({ variant: "outline" }),
                            )}
                        >
                            Open Settings
                        </Link>
                    </div>
                ) : (
                    <RepoPicker repos={repos} />
                )}
            </section>

            <div className="my-6 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs uppercase tracking-wider text-(--app-muted)">
                    Or
                </span>
                <Separator className="flex-1" />
            </div>

            <section className="app-panel space-y-4 p-6">
                <div>
                    <h2 className="app-title text-lg">Upload ZIP</h2>
                    <p className="mt-1 text-sm text-(--app-muted)">
                        No GitHub Connection Required. Works For Local Projects.
                    </p>
                </div>
                <ZipUploadForm />
            </section>
        </main>
    );
};

export default NewProjectsPage;

"use client";

import {
    createProjectFromGitHub,
    ProjectActionState,
} from "@/lib/actions/github";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { GitHubRepo } from "@/lib/github";
import { useActionState } from "react";

const initialState: ProjectActionState = {};

function AnalyzeButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            size="sm"
            disabled={pending}
            className="min-w-26 bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
        >
            {pending ? "Importing..." : "Analyze"}
        </Button>
    );
}

export function RepoPicker({ repos }: { repos: GitHubRepo[] }) {
    const [state, formAction] = useActionState(
        createProjectFromGitHub,
        initialState,
    );

    if (repos.length === 0) {
        return (
            <p className="text-sm text-(--app-muted)">
                No Repositories Found For This GitHub Account.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {state.error ? (
                <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
            <ul className="overflow-hidden rounded-2xl border border-(--app-line) bg-(--app-surface)">
                {repos.map((repo) => (
                    <li
                        key={repo.id}
                        className="flex flex-col gap-3 border-b border-(--app-line) p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="min-w-0">
                            <p className="truncate font-medium tracking-tight">
                                {repo.full_name}
                            </p>
                            <p className="mt-0.5 text-xs text-(--app-muted)">
                                {repo.private ? "Private" : "Public"} · Default
                                Branch {repo.default_branch}
                            </p>
                        </div>
                        <form action={formAction}>
                            <input
                                type="hidden"
                                name="fullName"
                                value={repo.full_name}
                            />
                            <input
                                type="hidden"
                                name="defaultBranch"
                                value={repo.default_branch}
                            />
                            <AnalyzeButton />
                        </form>
                    </li>
                ))}
            </ul>
        </div>
    );
}

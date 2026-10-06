"use server";

import { redirect } from "next/navigation";
import { auth } from "../auth";
import { prisma } from "../db";
import { setProjectProgress } from "../analysis/progress";
import { downloadGitHubZipball } from "../github";
import { MAX_REPO_SIZE_BYTES } from "../limits";
import { extractFromZipBuffer } from "../files/extract";
import { detectFramework } from "../files/framework";
import { isSourceFile } from "../files/filters";
import { deleteProjectFiles, persistProjectFiles } from "../files/storage";
import { buildProjectKnowledge } from "../analysis/pipeline";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { generateProjectReport } from "../analysis/report";

export type RetryState = {
    error?: string;
};

async function requireOwnedProject(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.user.id },
    });

    if (!project) return null;
    return project;
}

function githubFullName(project: {
    name: string;
    repositoryUrl: string | null;
}): string | null {
    if (project.name.includes("/")) return project.name;
    const match = project.repositoryUrl?.match(
        /github\.com\/([^/]+\/[^/#?]+)/i,
    );
    return match?.[1]?.replace(/\.git$/i, "") ?? null;
}

async function refreshProjectSources(project: {
    id: string;
    userId: string;
    name: string;
    source: "github" | "upload";
    repositoryUrl: string | null;
}): Promise<void> {
    if (project.source !== "github") return;

    const fullName = githubFullName(project);
    if (!fullName) {
        throw new Error(
            "Could Not Determine The GitHub Repository For This Project.",
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: project.userId },
        select: { githubAccessToken: true },
    });

    if (!user?.githubAccessToken) {
        throw new Error(
            "Connect GitHub In Settings Before Re-Analyzing This Repository.",
        );
    }

    await setProjectProgress(project.id, {
        step: "Fetching Latest Code From GitHub",
        percent: 10,
        status: "processing",
        errorMessage: null,
    });

    const zipBuffer = await downloadGitHubZipball(
        user.githubAccessToken,
        fullName,
    );

    if (zipBuffer.byteLength > MAX_REPO_SIZE_BYTES) {
        throw new Error(
            `Repository Archive Exceeds The ${MAX_REPO_SIZE_BYTES / (1024 * 1024)} MB Limit.`,
        );
    }

    await setProjectProgress(project.id, {
        step: "Reading Updated Files",
        percent: 18,
        status: "processing",
    });

    const extracted = await extractFromZipBuffer(zipBuffer, {
        stripRoot: true,
    });
    if (!extracted.ok) {
        throw new Error(extracted.error);
    }

    const framework = detectFramework(
        extracted.sourceFiles,
        extracted.allRelativePaths,
    );
    const sourceOnly = extracted.sourceFiles.filter((file) =>
        isSourceFile(file.relativePath),
    );

    await deleteProjectFiles(project.id);
    await persistProjectFiles(project.id, extracted.sourceFiles);

    await setProjectProgress(project.id, {
        step: "Files Ready For Analysis",
        percent: 25,
        status: "queued",
        framework,
        fileCount: sourceOnly.length,
        errorMessage:
            extracted.skippedLargeFiles.length > 0
                ? `Skipped ${extracted.skippedLargeFiles.length} File(s) Over The Size Limit.`
                : null,
    });
}

export async function retryProjectKnowledge(
    _prev: RetryState,
    formData: FormData,
): Promise<RetryState> {
    const projectId = String(formData.get("projectId") ?? "");
    if (!projectId) return { error: "Missing Project Id." };

    const project = await requireOwnedProject(projectId);
    if (!project) return { error: "Project Not Found." };

    try {
        await buildProjectKnowledge(project.id);
        revalidatePath(`/projects/${project.id}`);
        revalidatePath("/dashboard");
        redirect(`/projects/${project.id}`);
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Failed To Rebuild Code Knowledge.",
        };
    }
}

export async function retryFullAnalysis(
    _prev: RetryState,
    formData: FormData,
): Promise<RetryState> {
    const projectId = String(formData.get("projectId") ?? "");
    if (!projectId) return { error: "Missing Project Id." };

    const project = await requireOwnedProject(projectId);
    if (!project) return { error: "Project Not Found." };

    if (project.status === "processing" || project.status === "queued") {
        return { error: "Analysis Is Already Running For This Project." };
    }

    try {
        // Pull fresh GitHub code when possible; ZIP projects reuse local files.
        await refreshProjectSources(project);

        await prisma.project.update({
            where: { id: project.id },
            data: {
                status: "queued",
                progressStep:
                    project.source === "github"
                        ? "Latest Code Fetched — Waiting To Analyze"
                        : "Waiting To Restart Analysis",
                progressPercent: Math.max(project.progressPercent || 0, 25),
                errorMessage: null,
            },
        });
        revalidatePath(`/projects/${project.id}`);
        revalidatePath(`/projects/${project.id}/progress`);
        revalidatePath("/dashboard");
        redirect(`/projects/${project.id}/progress`);
    } catch (error) {
        if (isRedirectError(error)) throw error;

        await setProjectProgress(project.id, {
            step: "Re-Analyze Failed",
            percent: project.progressPercent || 0,
            status: "failed",
            errorMessage:
                error instanceof Error
                    ? error.message
                    : "Failed To Restart Project Analysis.",
        });
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Failed To Restart Project Analysis.",
        };
    }
}

export async function generateReportAction(
    _prev: RetryState,
    formData: FormData,
): Promise<RetryState> {
    const projectId = String(formData.get("projectId") ?? "");
    if (!projectId) return { error: "Missing Project Id." };

    const project = await requireOwnedProject(projectId);
    if (!project) return { error: "Project Not Found." };

    try {
        await generateProjectReport(project.id);
        revalidatePath(`/projects/${project.id}`);
        revalidatePath(`/projects/${project.id}/report`);
        revalidatePath("/dashboard");
        redirect(`/projects/${project.id}/report`);
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Failed To Generate Health Report.",
        };
    }
}

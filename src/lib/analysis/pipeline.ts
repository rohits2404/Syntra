import { chunkProjectFiles } from "./chunking";
import { setProjectProgress } from "./progress";
import { loadProjectSourceFiles } from "./project-files";
import { generateProjectReport } from "./report";
import { storeProjectChunks } from "./vector-store";

export async function buildProjectKnowledge(projectId: string): Promise<{
    chunkCount: number;
    fileCount: number;
}> {
    await setProjectProgress(projectId, {
        step: "Creating Code Knowledge",
        percent: 40,
        status: "processing",
        errorMessage: null,
    });

    try {
        const files = await loadProjectSourceFiles(projectId);
        if (files.length === 0) {
            throw new Error(
                "No JavaScript/TypeScript Source Files Found To Analyze.",
            );
        }

        await setProjectProgress(projectId, {
            step: "Chunking Source Files",
            percent: 50,
            fileCount: files.length,
        });

        const drafts = chunkProjectFiles(files);

        await setProjectProgress(projectId, {
            step: "Generating Embeddings",
            percent: 65,
        });

        const chunkCount = await storeProjectChunks(projectId, drafts);

        await setProjectProgress(projectId, {
            step: "Code Knowledge Ready",
            percent: 75,
            fileCount: files.length,
        });

        return { chunkCount, fileCount: files.length };
    } catch (error) {
        await setProjectProgress(projectId, {
            step: "Knowledge Build Failed",
            percent: 65,
            status: "failed",
            errorMessage:
                error instanceof Error
                    ? error.message
                    : "Failed To Build Code Knowledge Base.",
        });
        throw error;
    }
}

/**
 * Full analysis path used after import:
 * knowledge base first, then health report.
 */
export async function runFullProjectAnalysis(projectId: string): Promise<void> {
    await setProjectProgress(projectId, {
        step: "Starting Analysis",
        percent: 30,
        status: "processing",
        errorMessage: null,
    });

    await buildProjectKnowledge(projectId);

    await setProjectProgress(projectId, {
        step: "Running Analysis",
        percent: 80,
        status: "processing",
    });

    await setProjectProgress(projectId, {
        step: "Generating Report",
        percent: 90,
    });

    await generateProjectReport(projectId);

    await setProjectProgress(projectId, {
        step: "Complete",
        percent: 100,
        status: "completed",
        errorMessage: null,
    });
}

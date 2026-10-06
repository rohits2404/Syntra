import { readFile } from "fs/promises";
import { getProjectDataDir, ProjectManifestEntry } from "../files/storage";
import path from "path";
import { isSourceFile } from "../files/filters";

export type ProjectSourceFile = {
    relativePath: string;
    content: string;
};

/** Load extracted JS/TS source files for a project from disk. */
export async function loadProjectSourceFiles(
    projectId: string,
): Promise<ProjectSourceFile[]> {
    const root = getProjectDataDir(projectId);
    const manifestRaw = await readFile(
        path.join(root, "manifest.json"),
        "utf8",
    );
    const manifest = JSON.parse(manifestRaw) as ProjectManifestEntry[];

    const files: ProjectSourceFile[] = [];

    for (const entry of manifest) {
        if (!isSourceFile(entry.relativePath)) continue;
        const content = await readFile(
            path.join(root, "files", entry.relativePath),
            "utf8",
        );
        files.push({ relativePath: entry.relativePath, content });
    }

    return files;
}

"use client";

import { createProjectFromZip, ProjectActionState } from "@/lib/actions/github";
import { useActionState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const initialState: ProjectActionState = {};

export function ZipUploadForm() {
    const [state, formAction, pending] = useActionState(
        createProjectFromZip,
        initialState,
    );

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="file">ZIP file</Label>
                <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".zip,application/zip"
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Max 100 MB. Only JavaScript/TypeScript Source Files Are
                    Analyzed.
                </p>
            </div>
            {state.error ? (
                <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
            <Button
                type="submit"
                disabled={pending}
                className="bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
            >
                {pending ? "Uploading..." : "Upload and Analyze"}
            </Button>
        </form>
    );
}

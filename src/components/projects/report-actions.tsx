"use client";

import {
    generateReportAction,
    retryFullAnalysis,
    RetryState,
} from "@/lib/actions/analysis";
import { useActionState, useState } from "react";
import { ActionAlert } from "../ui/action-alert";
import { Button } from "../ui/button";

const initialState: RetryState = {};

export function GenerateReportButton({ projectId }: { projectId: string }) {
    const [state, formAction, pending] = useActionState(
        generateReportAction,
        initialState,
    );
    const [dismissed, setDismissed] = useState(false);
    const showError = Boolean(state.error) && !dismissed;

    return (
        <form
            action={(formData) => {
                setDismissed(false);
                formAction(formData);
            }}
            className="space-y-3"
        >
            <input type="hidden" name="projectId" value={projectId} />
            {showError && state.error ? (
                <ActionAlert
                    title="Couldn't Generate Report"
                    message={state.error}
                    onDismiss={() => setDismissed(true)}
                />
            ) : null}
            <Button
                type="submit"
                disabled={pending}
                className="bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
            >
                {pending ? "Generating Report..." : "Generate Health Report"}
            </Button>
        </form>
    );
}

export function RetryFullAnalysisButton({ projectId }: { projectId: string }) {
    const [state, formAction, pending] = useActionState(
        retryFullAnalysis,
        initialState,
    );
    const [dismissed, setDismissed] = useState(false);
    const showError = Boolean(state.error) && !dismissed;

    return (
        <form
            action={(formData) => {
                setDismissed(false);
                formAction(formData);
            }}
            className="space-y-3"
        >
            <input type="hidden" name="projectId" value={projectId} />
            {showError && state.error ? (
                <ActionAlert
                    title="Couldn't Restart Analysis"
                    message={state.error}
                    onDismiss={() => setDismissed(true)}
                />
            ) : null}
            <Button type="submit" disabled={pending} variant="outline">
                {pending ? "Starting..." : "Analyze Again"}
            </Button>
        </form>
    );
}

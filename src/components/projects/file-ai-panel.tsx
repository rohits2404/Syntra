"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ActionAlert } from "../ui/action-alert";

const QUICK_PROMPTS = [
    {
        label: "Explain This File",
        prompt: "Explain This File.",
    },
    {
        label: "Find Potential Issues",
        prompt: "Find Potential Issues In This File.",
    },
    {
        label: "Summarize Exports & Responsibilities",
        prompt: "Summarize The Main Exports and Responsibilities.",
    },
];

export function FileAiPanel({
    projectId,
    filePath,
}: {
    projectId: string;
    filePath: string | null;
}) {
    const [question, setQuestion] = useState("Explain This File.");

    const [answer, setAnswer] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function ask(nextQuestion: string) {
        if (!filePath || !nextQuestion.trim() || pending) {
            return;
        }

        setPending(true);
        setError(null);
        setAnswer(null);

        try {
            const response = await fetch("/api/explorer/explain", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectId,
                    filePath,
                    question: nextQuestion.trim(),
                }),
            });

            const data = (await response.json()) as {
                answer?: string;
                error?: string;
            };

            if (!response.ok) {
                throw new Error(data.error ?? "Request Failed");
            }

            setAnswer(data.answer ?? "");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed To Ask AI");
        } finally {
            setPending(false);
        }
    }

    if (!filePath) {
        return (
            <div className="app-panel border-dashed p-4 text-sm text-(--app-muted)">
                Select a File To Ask The AI About It.
            </div>
        );
    }

    return (
        <div className="app-panel min-w-0 space-y-3 overflow-hidden p-4">
            <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight">
                    AI Assistant
                </p>

                <p className="mt-0.5 truncate text-xs text-(--app-muted)">
                    Asking about{" "}
                    <span className="font-medium text-foreground">
                        {filePath}
                    </span>
                </p>
            </div>

            <div className="flex min-w-0 flex-col gap-2">
                {QUICK_PROMPTS.map((item) => (
                    <Button
                        key={item.prompt}
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        className="h-auto w-full justify-start whitespace-normal px-3 py-2 text-left text-xs leading-snug"
                        onClick={() => {
                            setQuestion(item.prompt);
                            void ask(item.prompt);
                        }}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            <form
                onSubmit={async (event) => {
                    event.preventDefault();
                    await ask(question);
                }}
                className="min-w-0 space-y-3"
            >
                <Textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    rows={3}
                    disabled={pending}
                    placeholder="Ask About This File..."
                    className="min-w-0 resize-y"
                />

                <Button
                    type="submit"
                    disabled={pending || !question.trim()}
                    className="bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
                >
                    {pending ? "Thinking..." : "Ask AI"}
                </Button>
            </form>

            {error ? (
                <ActionAlert
                    title="Couldn't Get an Answer"
                    message={error}
                    onDismiss={() => setError(null)}
                />
            ) : null}

            {answer ? (
                <div className="max-h-112 overflow-auto rounded-xl bg-muted/40 p-3 text-sm whitespace-pre-wrap wrap-break-word">
                    {answer}
                </div>
            ) : null}
        </div>
    );
}

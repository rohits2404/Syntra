"use client";

import { ChatSource } from "@/lib/analysis/chat-rag";
import { DefaultChatTransport, UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

function getMessageText(message: UIMessage): string {
    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => ("text" in part ? part.text : ""))
        .join("");
}

function getMessageSources(message: UIMessage): ChatSource[] {
    const metadata = message.metadata as
        | {
              sources?: ChatSource[];
          }
        | undefined;

    return metadata?.sources ?? [];
}

export function ProjectChat({
    projectId,
    projectName,
}: {
    projectId: string;
    projectName: string;
}) {
    const [input, setInput] = useState("");

    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: "/api/chat",
                body: {
                    projectId,
                },
            }),
        [projectId],
    );

    const { messages, sendMessage, status, error, stop, clearError } = useChat({
        transport,
    });

    const busy = status === "submitted" || status === "streaming";

    return (
        <div className="flex min-h-[70vh] flex-col gap-4">
            {/* Project information */}
            <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                Ask Questions About{" "}
                <span className="font-medium text-foreground">
                    {projectName}
                </span>
                . Answers Are Grounded In Retrieved Code Chunks From This
                Project.
            </div>

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-xl border p-4">
                {messages.length === 0 ? (
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Try Asking:</p>

                        <ul className="list-disc space-y-1 ps-5">
                            <li>Explain The Authentication Flow.</li>
                            <li>Where Is User Authorization Handled?</li>
                            <li>How Does Payment Processing Work?</li>
                        </ul>
                    </div>
                ) : (
                    messages.map((message) => {
                        const text = getMessageText(message);
                        const sources = getMessageSources(message);
                        const isUser = message.role === "user";

                        return (
                            <div
                                key={message.id}
                                className={`max-w-[90%] rounded-xl px-4 py-3 text-sm ${
                                    isUser
                                        ? "ms-auto bg-primary text-primary-foreground"
                                        : "me-auto bg-muted"
                                }`}
                            >
                                {/* Message author */}
                                <p className="mb-1 text-xs opacity-70">
                                    {isUser ? "You" : "AI Engineer"}
                                </p>

                                {/* Message content */}
                                <div className="whitespace-pre-wrap">
                                    {text ||
                                        (busy && !isUser ? "Thinking..." : "")}
                                </div>

                                {/* Sources */}
                                {!isUser && sources.length > 0 ? (
                                    <div className="mt-3 border-t border-border/50 pt-2">
                                        <p className="mb-1 text-xs font-medium opacity-80">
                                            Sources
                                        </p>

                                        <ul className="space-y-1 text-xs opacity-90">
                                            {sources.map((source, index) => (
                                                <li
                                                    key={`${source.filePath}-${index}`}
                                                >
                                                    {source.filePath}

                                                    {source.startLine != null &&
                                                    source.endLine != null
                                                        ? `:${source.startLine}-${source.endLine}`
                                                        : ""}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Error */}
            {error ? (
                <p className="text-sm text-destructive">{error.message}</p>
            ) : null}

            {/* Chat form */}
            <form
                onSubmit={async (event) => {
                    event.preventDefault();

                    const text = input.trim();

                    if (!text || busy) {
                        return;
                    }

                    clearError();
                    setInput("");

                    await sendMessage({
                        text,
                    });
                }}
                className="flex flex-col gap-3"
            >
                <Textarea
                    value={input}
                    onChange={(event) => {
                        setInput(event.target.value);
                    }}
                    placeholder="Ask About This Codebase..."
                    rows={3}
                    disabled={busy}
                />

                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={busy || !input.trim()}>
                        {busy ? "Sending..." : "Send"}
                    </Button>

                    {busy ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => stop()}
                        >
                            Stop
                        </Button>
                    ) : null}
                </div>
            </form>
        </div>
    );
}

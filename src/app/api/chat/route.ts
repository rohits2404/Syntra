import {
    convertToModelMessages,
    createUIMessageStreamResponse,
    streamText,
    toUIMessageStream,
    type UIMessage,
} from "ai";

import { getLanguageModel } from "@/lib/ai/llm";
import {
    buildChatSystemPrompt,
    type ChatSource,
    extractLastUserText,
    retrieveChatContext,
} from "@/lib/analysis/chat-rag";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertChatRateLimit, RateLimitError } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatRequestBody = {
    messages: UIMessage[];
    projectId?: string;
};

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await request.json()) as ChatRequestBody;

        const projectId = body.projectId;
        const messages = body.messages ?? [];

        if (!projectId) {
            return Response.json(
                { error: "Project Id Is Required" },
                { status: 400 },
            );
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return Response.json(
                { error: "Messages are Required" },
                { status: 400 },
            );
        }

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: session.user.id,
            },
            include: {
                _count: {
                    select: {
                        chunks: true,
                    },
                },
            },
        });

        if (!project) {
            return Response.json(
                { error: "Project Not Found" },
                { status: 404 },
            );
        }

        if (project._count.chunks === 0) {
            return Response.json(
                {
                    error: "This Project Has No Indexed Code Chunks Yet. Finish Knowledge Building First.",
                },
                { status: 400 },
            );
        }

        await assertChatRateLimit(session.user.id);

        const question = extractLastUserText(messages);

        if (!question) {
            return Response.json(
                {
                    error: "Could Not Find A User Question In The Messages.",
                },
                { status: 400 },
            );
        }

        const { chunks, sources } = await retrieveChatContext(
            project.id,
            question,
        );

        const result = streamText({
            model: getLanguageModel(),

            system: buildChatSystemPrompt({
                projectName: project.name,
                framework: project.framework,
                chunks,
            }),

            messages: await convertToModelMessages(messages),
        });

        const stream = toUIMessageStream({
            stream: result.stream,

            originalMessages: messages,

            messageMetadata: ({
                part,
            }): { sources: ChatSource[] } | undefined => {
                if (part.type === "finish") {
                    return {
                        sources,
                    };
                }

                return undefined;
            },
        });

        return createUIMessageStreamResponse({
            stream,
        });
    } catch (error) {
        if (error instanceof RateLimitError) {
            return Response.json({ error: error.message }, { status: 429 });
        }

        console.error("Chat API error:", error);

        return Response.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed To Answer The Question.",
            },
            { status: 500 },
        );
    }
}

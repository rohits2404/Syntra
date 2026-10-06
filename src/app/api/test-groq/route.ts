import { generateText, Output } from "ai";
import { z } from "zod";
import { getStructuredLanguageModel } from "@/lib/ai/llm";

export const runtime = "nodejs";

const testSchema = z.object({
    summary: z.string(),
    score: z.number(),
});

export async function GET() {
    try {
        const { output } = await generateText({
            model: getStructuredLanguageModel(),

            output: Output.object({
                schema: testSchema,
            }),

            prompt: "Return a short summary saying the application is healthy and give it a score of 8.",
        });

        return Response.json({
            ok: true,
            output,
        });
    } catch (error) {
        console.error("[TEST GROQ ERROR]", error);

        return Response.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

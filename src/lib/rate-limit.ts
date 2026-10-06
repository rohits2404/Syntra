import { prisma } from "@/lib/db";

type Bucket = number[];

const chatBuckets = new Map<string, Bucket>();

export async function assertChatRateLimit(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, planStatus: true },
    });

    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const previous = chatBuckets.get(userId) ?? [];
    const recent = previous.filter((timestamp) => now - timestamp < windowMs);

    recent.push(now);
    chatBuckets.set(userId, recent);
}

export class RateLimitError extends Error {
    status = 429;

    constructor(message: string) {
        super(message);
        this.name = "RateLimitError";
    }
}

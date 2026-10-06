import { createHmac, timingSafeEqual } from "crypto";
import { decryptToken } from "./encryption";

const GITHUB_API = "https://api.github.com";

export type GitHubRepo = {
    id: number;
    full_name: string;
    name: string;
    private: boolean;
    html_url: string;
    default_branch: string;
    pushed_at: string | null;
    size: number; // KB according to GitHub API
};

function getAppUrl() {
    return process.env.AUTH_URL ?? "http://localhost:3000";
}

function signState(payload: string): string {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET Is Not Set");
    const signature = createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
    return `${payload}.${signature}`;
}

export function createGitHubOAuthState(userId: string): string {
    const payload = Buffer.from(
        JSON.stringify({ userId, ts: Date.now() }),
        "utf8",
    ).toString("base64url");
    return signState(payload);
}

export function verifyGitHubOAuthState(
    state: string,
): { userId: string } | null {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;

    const [payload, signature] = state.split(".");
    if (!payload || !signature) return null;

    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    try {
        const parsed = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8"),
        ) as { userId?: string; ts?: number };
        if (!parsed.userId || !parsed.ts) return null;
        // State valid for 10 minutes
        if (Date.now() - parsed.ts > 10 * 60 * 1000) return null;
        return { userId: parsed.userId };
    } catch {
        return null;
    }
}

export function getGitHubAuthorizeUrl(state: string): string {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) throw new Error("GITHUB_CLIENT_ID Is Not Set");

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: `${getAppUrl()}/api/github/callback`,
        scope: "read:user user:email repo",
        state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGitHubCode(code: string): Promise<{
    accessToken: string;
    login: string;
}> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error("GitHub OAuth Env Vars are Missing");
    }

    const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: `${getAppUrl()}/api/github/callback`,
            }),
        },
    );

    if (!tokenRes.ok) {
        throw new Error("Failed To Exchange GitHub OAuth Code");
    }

    const tokenJson = (await tokenRes.json()) as {
        access_token?: string;
        error?: string;
    };

    if (!tokenJson.access_token) {
        throw new Error(
            tokenJson.error ?? "GitHub Did Not Return an Access Token",
        );
    }

    const userRes = await fetch(`${GITHUB_API}/user`, {
        headers: {
            Authorization: `Bearer ${tokenJson.access_token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "ai-codebase-auditor",
        },
    });

    if (!userRes.ok) {
        throw new Error("Failed To Fetch GitHub User Profile");
    }

    const profile = (await userRes.json()) as { login?: string };
    if (!profile.login) {
        throw new Error("GitHub Profile Is Missing a Username");
    }

    return { accessToken: tokenJson.access_token, login: profile.login };
}

export async function listGitHubRepos(
    encryptedToken: string,
): Promise<GitHubRepo[]> {
    const token = decryptToken(encryptedToken);
    const repos: GitHubRepo[] = [];
    let page = 1;

    while (page <= 5) {
        const res = await fetch(
            `${GITHUB_API}/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github+json",
                    "User-Agent": "ai-codebase-auditor",
                },
                cache: "no-store",
            },
        );

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                throw new Error(
                    "GitHub Access Denied. Reconnect GitHub In Settings And Check Permissions.",
                );
            }
            throw new Error("Failed To List GitHub Repositories");
        }

        const batch = (await res.json()) as GitHubRepo[];
        repos.push(...batch);
        if (batch.length < 100) break;
        page += 1;
    }

    return repos;
}

export async function downloadGitHubZipball(
    encryptedToken: string,
    fullName: string,
    ref?: string,
): Promise<Buffer> {
    const token = decryptToken(encryptedToken);
    const url = ref
        ? `${GITHUB_API}/repos/${fullName}/zipball/${encodeURIComponent(ref)}`
        : `${GITHUB_API}/repos/${fullName}/zipball`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "ai-codebase-auditor",
        },
        redirect: "follow",
    });

    if (!res.ok) {
        if (res.status === 404) {
            throw new Error(
                "Repository Not Found Or You Do Not Have Access To This Private Repo.",
            );
        }
        throw new Error("Failed To Download Repository Archive From GitHub");
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

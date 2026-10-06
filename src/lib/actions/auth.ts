"use server";

import { z } from "zod";
import { prisma } from "../db";
import { hash } from "bcryptjs";
import { signIn, signOut } from "../auth";
import { AuthError } from "next-auth";

const registerSchema = z.object({
    firstName: z.string().min(1).max(40),
    lastName: z.string().min(1).max(40),
    email: z.email(),
    password: z.string().min(8).max(100),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

export type AuthFormState = {
    error?: string;
    success?: boolean;
};

export async function registerWithEmail(
    _prev: AuthFormState,
    formData: FormData,
): Promise<AuthFormState> {
    const parsed = registerSchema.safeParse({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        return {
            error: "Please Check The Form Fields and Try Again.",
        };
    }

    const existing = await prisma.user.findUnique({
        where: { email: parsed.data.email },
    });

    if (existing) {
        return {
            error: "An Account With This Email Is Already Exists",
        };
    }

    const passwordHash = await hash(parsed.data.password, 12);

    const name = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();

    await prisma.user.create({
        data: {
            name,
            email: parsed.data.email,
            passwordHash,
            authProvider: "email",
        },
    });

    try {
        await signIn("credentials", {
            email: parsed.data.email,
            password: parsed.data.password,
            redirectTo: "/dashboard",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return {
                error: "Account Created, But Sign-In Failed. Please Try Signing In.",
            };
        }
        throw error;
    }

    return { success: true };
}

export async function loginWithEmail(
    _prev: AuthFormState,
    formData: FormData,
): Promise<AuthFormState> {
    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        return { error: "Invalid Email or Password" };
    }

    try {
        await signIn("credentials", {
            email: parsed.data.email,
            password: parsed.data.password,
            redirectTo: "/dashboard",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: "Invalid Email or Password" };
        }
        throw error;
    }

    return { success: true };
}

export async function loginWithGoogle() {
    await signIn("google", { redirectTo: "/dashboard" });
}

export async function loginWithGithub() {
    await signIn("github", { redirectTo: "/dashboard" });
}

export async function signOutAction() {
    await signOut({ redirectTo: "/" });
}

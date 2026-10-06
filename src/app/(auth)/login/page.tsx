import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const LoginPage = async () => {
    const session = await auth();
    if (session?.user) redirect("/dashboard");

    return (
        <AuthShell mode="login">
            <LoginForm />
        </AuthShell>
    );
};

export default LoginPage;

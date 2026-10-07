import { AppShell } from "@/components/app-shell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return <AppShell>{children}</AppShell>;
};

export default MainLayout;

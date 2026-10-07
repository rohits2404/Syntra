import {
    ManageBillingButton,
    RefreshBillingButton,
    UpgradeToPremiumButton,
} from "@/components/billing/biiling-buttons";
import { Button, buttonVariants } from "@/components/ui/button";
import { connectGitHubAccount, disconnectGitHub } from "@/lib/actions/github";
import { auth } from "@/lib/auth";
import { getBillingSnapshot } from "@/lib/billing/entitlements";
import {
    effectivePlanId,
    getPlansWithStripePricing,
} from "@/lib/billing/plans";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type PageProps = {
    searchParams: Promise<{
        github?: string;
        github_error?: string;
        billing?: string;
        session_id?: string;
    }>;
};

function formatLimit(n: number) {
    return Number.isFinite(n) ? String(n) : "∞";
}

const SettingsPage = async ({ searchParams }: PageProps) => {
    const session = await auth();
    if (!session?.user) return null;

    const params = await searchParams;
    const plans = await getPlansWithStripePricing();
    const paid = plans.premium;

    // Activate plan after Checkout even if the webhook was missed (local/dev).
    if (params.billing === "success") {
        const { syncCheckoutSessionForUser, syncCustomerSubscriptionsForUser } =
            await import("@/lib/billing/sync-checkout");

        if (params.session_id) {
            await syncCheckoutSessionForUser(
                session.user.id,
                params.session_id,
            );
        } else {
            await syncCustomerSubscriptionsForUser(session.user.id);
        }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            authProvider: true,
            githubUsername: true,
            githubAccessToken: true,
        },
    });

    const billing = await getBillingSnapshot(session.user.id);
    const planId = effectivePlanId(billing.plan, billing.planStatus);
    const isPaid = planId === "premium";
    const current = plans[planId];
    const githubConnected = Boolean(user?.githubAccessToken);

    return (
        <main className="app-page app-page-narrow">
            <header className="mb-8">
                <p className="app-kicker">Account</p>
                <h1 className="app-title mt-2 text-3xl">Settings</h1>
                <p className="mt-2 text-sm text-(--app-muted)">
                    Manage Your Profile, Plan, And GitHub Connection.
                </p>
            </header>

            {params.github === "connected" ? (
                <p className="mb-4 rounded-2xl border border-(--app-line) bg-(--app-accent)/10 px-4 py-3 text-sm text-(--app-accent-deep)">
                    GitHub Connected Successfully.
                </p>
            ) : null}
            {params.github_error ? (
                <p className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    GitHub Connection Failed ({params.github_error}). Try Again.
                </p>
            ) : null}
            {params.billing === "success" ? (
                <p className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                    Payment Received
                    {isPaid
                        ? `. Your ${paid.label} Plan Is Active.`
                        : `. If The Plan Still Shows ${plans.free.label}, Click “Refresh Plan From Stripe”.`}
                </p>
            ) : null}
            {params.billing === "synced" ? (
                <p className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                    Plan Synced From Stripe Successfully.
                </p>
            ) : null}
            {params.billing === "sync_failed" ? (
                <p className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    No Active Stripe Subscription Found For This Account Yet.
                    Wait a Moment and Try Refresh Again, or Confirm Payment In
                    The Stripe Dashboard.
                </p>
            ) : null}
            {params.billing === "canceled" ? (
                <p className="mb-4 rounded-2xl border border-(--app-line) bg-muted/40 px-4 py-3 text-sm text-(--app-muted)">
                    Checkout Was Canceled. You Can Upgrade Anytime.
                </p>
            ) : null}

            <section className="app-panel mb-5 space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="app-title text-lg">Billing</h2>
                        <p className="mt-1 text-sm text-(--app-muted)">
                            {plans.free.label} Includes Limited Daily Analyses.{" "}
                            {paid.label} Unlocks Higher Limits.
                        </p>
                    </div>
                    <span
                        className={cn(
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                            isPaid
                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                                : "border-(--app-line) bg-muted/50 text-(--app-muted)",
                        )}
                    >
                        {current.label}
                        {billing.planStatus === "past_due" ? " · past due" : ""}
                    </span>
                </div>

                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    <div className="rounded-xl border border-(--app-line) px-3 py-2.5">
                        <dt className="text-xs text-(--app-muted)">
                            Analyses Today
                        </dt>
                        <dd className="mt-1 font-semibold tabular-nums">
                            {billing.analysesUsedToday}
                            <span className="font-normal text-(--app-muted)">
                                {" "}
                                / {formatLimit(billing.limits.analysesPerDay)}
                            </span>
                        </dd>
                    </div>
                    <div className="rounded-xl border border-(--app-line) px-3 py-2.5">
                        <dt className="text-xs text-(--app-muted)">Projects</dt>
                        <dd className="mt-1 font-semibold tabular-nums">
                            {billing.projectCount}
                            <span className="font-normal text-(--app-muted)">
                                {" "}
                                / {formatLimit(billing.limits.maxProjects)}
                            </span>
                        </dd>
                    </div>
                    <div className="rounded-xl border border-(--app-line) px-3 py-2.5 sm:col-span-2">
                        <dt className="text-xs text-(--app-muted)">
                            Chat Messages / Hour
                        </dt>
                        <dd className="mt-1 font-semibold tabular-nums">
                            Up To {billing.limits.chatPerHour}
                        </dd>
                    </div>
                </dl>

                <div className="flex flex-wrap items-center gap-2">
                    {isPaid ? (
                        <ManageBillingButton />
                    ) : (
                        <>
                            <UpgradeToPremiumButton
                                label={`Upgrade to ${paid.label}`}
                                planLabel={paid.label}
                                priceLabel={paid.priceLabel}
                                features={paid.features}
                            />
                            {billing.hasStripeCustomer ? (
                                <ManageBillingButton />
                            ) : null}
                        </>
                    )}
                    {billing.hasStripeCustomer ? (
                        <RefreshBillingButton />
                    ) : null}
                </div>

                {!isPaid ? (
                    <ul className="space-y-1.5 text-sm text-(--app-muted)">
                        <li>
                            {paid.label} · {paid.priceLabel}
                        </li>
                        {paid.features.map((feature) => (
                            <li key={feature}>{feature}</li>
                        ))}
                    </ul>
                ) : null}
            </section>

            <section className="app-panel mb-5 space-y-3 p-6">
                <h2 className="app-title text-lg">Profile</h2>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-(--app-muted)">Name</dt>
                        <dd className="font-medium">{user?.name ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-(--app-muted)">Email</dt>
                        <dd className="font-medium">{user?.email ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-(--app-muted)">Auth provider</dt>
                        <dd className="font-medium capitalize">
                            {user?.authProvider ?? "—"}
                        </dd>
                    </div>
                </dl>
            </section>

            <section className="app-panel space-y-4 p-6">
                <div>
                    <h2 className="app-title text-lg">GitHub</h2>
                    <p className="mt-1 text-sm text-(--app-muted)">
                        Required To Select a Repository. If You Signed In With
                        GitHub, The Connection Already Appears Here.
                    </p>
                </div>
                {githubConnected ? (
                    <>
                        <p className="text-sm">
                            Connected as{" "}
                            <span className="font-semibold text-(--app-accent-deep)">
                                {user?.githubUsername ?? "GitHub"}
                            </span>
                        </p>
                        <form action={disconnectGitHub}>
                            <Button type="submit" variant="outline">
                                Disconnect GitHub
                            </Button>
                        </form>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-(--app-muted)">
                            GitHub Is Not Connected Yet.
                        </p>
                        <form action={connectGitHubAccount}>
                            <Button
                                type="submit"
                                className="bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
                            >
                                Connect GitHub
                            </Button>
                        </form>
                    </>
                )}
                <Link
                    href="/dashboard"
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "px-0",
                    )}
                >
                    ← Back To Projects
                </Link>
            </section>
        </main>
    );
};

export default SettingsPage;

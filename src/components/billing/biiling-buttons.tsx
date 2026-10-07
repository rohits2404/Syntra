"use client";

import {
    openBillingPortal,
    refreshBillingFromStripe,
    startPremiumCheckout,
} from "@/lib/actions/billing";
import { useState, useTransition } from "react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

type UpgradeProps = {
    className?: string;
    label?: string;
    planLabel?: string;
    priceLabel?: string;
    features?: string[];
};

export function UpgradeToPremiumButton({
    className,
    label = "Upgrade To Premium",
    planLabel = "Premium",
    priceLabel = "See Checkout",
    features = [],
}: UpgradeProps) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    function confirmCheckout() {
        startTransition(() => {
            void startPremiumCheckout();
        });
    }

    return (
        <>
            <Button
                type="button"
                disabled={pending}
                className={
                    className ??
                    "bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
                }
                onClick={() => setOpen(true)}
            >
                {pending ? "Redirecting To Stripe..." : label}
            </Button>

            <Dialog
                open={open}
                onOpenChange={(next) => {
                    if (!pending) setOpen(next);
                }}
            >
                <DialogContent showCloseButton={!pending}>
                    <DialogHeader>
                        <DialogTitle>Confirm {planLabel} Upgrade</DialogTitle>
                        <DialogDescription>
                            Review Your Plan, Then Continue To Stripe Checkout
                            To Pay Securely. You Can Cancel Anytime From Billing
                            Settings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl border border-(--app-line) bg-(--app-accent)/4 p-4">
                        <div className="flex items-baseline justify-between gap-3">
                            <p className="font-semibold tracking-tight">
                                {planLabel}
                            </p>
                            <p className="text-lg font-bold tabular-nums text-(--app-accent-deep)">
                                {priceLabel}
                            </p>
                        </div>
                        {features.length > 0 ? (
                            <ul className="mt-3 space-y-1.5 text-sm text-(--app-muted)">
                                {features.map((feature) => (
                                    <li key={feature} className="flex gap-2">
                                        <span className="text-(--app-accent-deep)">
                                            ✓
                                        </span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={pending}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={pending}
                            className="bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
                            onClick={confirmCheckout}
                        >
                            {pending ? "Redirecting..." : "Continue To Stripe"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

/** @deprecated Use UpgradeToPremiumButton */
export function UpgradeToProButton(props: UpgradeProps) {
    return <UpgradeToPremiumButton {...props} />;
}

export function ManageBillingButton() {
    const [pending, startTransition] = useTransition();

    return (
        <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
                startTransition(() => {
                    void openBillingPortal();
                });
            }}
        >
            {pending ? "Opening Portal..." : "Manage Billing"}
        </Button>
    );
}

export function RefreshBillingButton() {
    const [pending, startTransition] = useTransition();

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
                startTransition(() => {
                    void refreshBillingFromStripe();
                });
            }}
        >
            {pending ? "Syncing..." : "Refresh Plan From Stripe"}
        </Button>
    );
}

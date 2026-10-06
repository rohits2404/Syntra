"use client";

import { signOutAction } from "@/lib/actions/auth";
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

export function SignOutButton() {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    function confirmSignOut() {
        startTransition(() => {
            void signOutAction();
        });
    }

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
            >
                Sign Out
            </Button>

            <Dialog
                open={open}
                onOpenChange={(next) => {
                    if (!pending) setOpen(next);
                }}
            >
                <DialogContent showCloseButton={!pending}>
                    <DialogHeader>
                        <DialogTitle>Sign Out ?</DialogTitle>
                        <DialogDescription>
                            You Will Need To Sign In Again To Access Your
                            Projects And Analyses.
                        </DialogDescription>
                    </DialogHeader>
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
                            variant="destructive"
                            onClick={confirmSignOut}
                        >
                            {pending ? "Signing Out..." : "Sign Out"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

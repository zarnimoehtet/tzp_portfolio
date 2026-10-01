"use client";

import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown> | void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: ConfirmDialogProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await onConfirm();
                onOpenChange(false);
              })
            }
          >
            {isPending ? "Working…" : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Convenience hook: `confirm.ask(fn)` opens the dialog for a given action. */
export function useConfirm() {
  const [pending, setPending] = useState<null | (() => Promise<unknown> | void)>(null);
  return {
    open: pending !== null,
    ask: (fn: () => Promise<unknown> | void) => setPending(() => fn),
    onOpenChange: (open: boolean) => !open && setPending(null),
    onConfirm: () => pending?.(),
  };
}

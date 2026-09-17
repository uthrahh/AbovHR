"use client";

import { useActionState } from "react";
import { submitDataRequestAction } from "@/lib/actions/data-request";
import { Button } from "@/components/ui/button";

export function DataRequestForm({ type, label }: { type: "EXPORT" | "DELETE"; label: string }) {
  const [state, formAction, isPending] = useActionState(submitDataRequestAction.bind(null, type), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Button type="submit" variant={type === "DELETE" ? "danger" : "secondary"} loading={isPending} className="self-start">
        {label}
      </Button>
      {state?.message && (
        <p role="status" className="text-sm text-[var(--color-text-secondary)]">
          {state.message}
        </p>
      )}
    </form>
  );
}

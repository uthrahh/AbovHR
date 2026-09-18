"use client";

import { useActionState, useRef } from "react";
import { addAwardAction, deleteAwardAction } from "@/lib/actions/profile";
import { TextField, TextAreaField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";

type AwardItem = { id: string; title: string; issuer: string | null; awardDate: Date | null; description: string | null };

export function AwardsSection({ items }: { items: AwardItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addAwardAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No awards or achievements added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((award) => (
            <li key={award.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{award.title}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {award.issuer}
                  {award.awardDate ? ` · ${award.awardDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}
                </p>
              </div>
              <form action={deleteAwardAction.bind(null, award.id)}>
                <button type="submit" aria-label={`Remove ${award.title}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4 sm:grid-cols-2">
        {state?.message && <p className="text-sm font-medium text-[var(--color-error)] sm:col-span-2">{state.message}</p>}
        <TextField label="Title" name="title" required />
        <TextField label="Issued by" name="issuer" optional />
        <TextField label="Date" name="awardDate" type="date" optional />
        <TextAreaField label="Description" name="description" optional rows={2} wrapperClassName="sm:col-span-2" />
        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start sm:col-span-2">
          Add award
        </Button>
      </form>
    </div>
  );
}

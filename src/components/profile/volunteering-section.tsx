"use client";

import { useActionState, useRef, useState } from "react";
import { addVolunteeringAction, deleteVolunteeringAction } from "@/lib/actions/profile";
import { TextField, TextAreaField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";

type VolunteeringItem = {
  id: string;
  organization: string;
  role: string;
  cause: string | null;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
};

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function VolunteeringSection({ items }: { items: VolunteeringItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addVolunteeringAction(prev as never, formData);
    if (result?.ok) {
      formRef.current?.reset();
      setIsCurrent(false);
    }
    return result;
  }, undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No volunteering experience added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((v) => (
            <li key={v.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{v.role}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {v.organization}
                  {v.cause ? ` · ${v.cause}` : ""}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatMonthYear(v.startDate)} – {v.isCurrent ? "Present" : v.endDate ? formatMonthYear(v.endDate) : "—"}
                </p>
              </div>
              <form action={deleteVolunteeringAction.bind(null, v.id)}>
                <button type="submit" aria-label={`Remove ${v.role} at ${v.organization}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4 sm:grid-cols-2">
        {state?.message && <p className="text-sm font-medium text-[var(--color-error)] sm:col-span-2">{state.message}</p>}
        <TextField label="Organization" name="organization" required />
        <TextField label="Role" name="role" required />
        <TextField label="Cause / area" name="cause" placeholder="e.g. Education, Environment" optional />
        <TextField label="Start date" name="startDate" type="date" required />
        <TextField label="End date" name="endDate" type="date" disabled={isCurrent} optional={isCurrent} />
        <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] sm:col-span-2">
          <input
            type="checkbox"
            name="isCurrent"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent-text)]"
          />
          I currently volunteer here
        </label>
        <TextAreaField label="Description" name="description" optional rows={3} wrapperClassName="sm:col-span-2" />
        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start sm:col-span-2">
          Add volunteering
        </Button>
      </form>
    </div>
  );
}

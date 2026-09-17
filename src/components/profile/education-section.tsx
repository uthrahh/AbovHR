"use client";

import { useActionState, useRef } from "react";
import { addEducationAction, deleteEducationAction } from "@/lib/actions/profile";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";

type EducationItem = {
  id: string;
  institutionName: string;
  degree: string;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
};

export function EducationSection({ items }: { items: EducationItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addEducationAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No education added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((edu) => (
            <li key={edu.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{edu.institutionName}</p>
                {(edu.startYear || edu.endYear) && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {edu.startYear ?? ""} – {edu.endYear ?? "Present"}
                  </p>
                )}
              </div>
              <form action={deleteEducationAction.bind(null, edu.id)}>
                <button type="submit" aria-label={`Remove ${edu.degree} at ${edu.institutionName}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4 sm:grid-cols-2">
        {state?.message && <p className="text-sm font-medium text-[var(--color-error)] sm:col-span-2">{state.message}</p>}
        <TextField label="Institution" name="institutionName" required />
        <TextField label="Degree" name="degree" required placeholder="e.g. B.Tech" />
        <TextField label="Field of study" name="fieldOfStudy" optional />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Start year" name="startYear" type="number" min={1970} max={2100} optional />
          <TextField label="End year" name="endYear" type="number" min={1970} max={2100} optional />
        </div>
        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start sm:col-span-2">
          Add education
        </Button>
      </form>
    </div>
  );
}

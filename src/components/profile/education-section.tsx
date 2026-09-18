"use client";

import { useActionState, useRef } from "react";
import { addEducationAction, deleteEducationAction } from "@/lib/actions/profile";
import { TextField, SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrashIcon } from "@/components/ui/icons";

type EducationItem = {
  id: string;
  level: string;
  institutionName: string;
  degree: string;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  gradeValue: string | null;
};

const LEVEL_LABEL: Record<string, string> = {
  SECONDARY: "10th / Secondary",
  HIGHER_SECONDARY: "12th / Higher Secondary",
  DIPLOMA: "Diploma",
  UNDERGRADUATE: "Undergraduate",
  POSTGRADUATE: "Postgraduate",
  DOCTORATE: "Doctorate",
  CERTIFICATE_PROGRAM: "Certificate program",
  OTHER: "Other",
};

export function EducationSection({ items }: { items: EducationItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addEducationAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  const sorted = [...items].sort((a, b) => (b.endYear ?? 9999) - (a.endYear ?? 9999));

  return (
    <div className="flex flex-col gap-4">
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No education added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((edu) => (
            <li key={edu.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{LEVEL_LABEL[edu.level] ?? edu.level}</Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">
                  {edu.degree}
                  {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">{edu.institutionName}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {edu.startYear ? `${edu.startYear} – ` : ""}
                  {edu.endYear ?? (edu.startYear ? "Present" : "")}
                  {edu.gradeValue ? ` · ${edu.gradeValue}` : ""}
                </p>
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
        <SelectField label="Level" name="level" defaultValue="UNDERGRADUATE" required>
          {Object.entries(LEVEL_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <TextField label="Institution" name="institutionName" required />
        <TextField label="Degree / qualification" name="degree" required placeholder="e.g. B.Tech, or SSC" />
        <TextField label="Field of study" name="fieldOfStudy" optional />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Start year" name="startYear" type="number" min={1970} max={2100} optional />
          <TextField label="End year" name="endYear" type="number" min={1970} max={2100} optional />
        </div>
        <TextField label="Grade / percentage / CGPA" name="gradeValue" placeholder="e.g. 8.4 CGPA" optional />
        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start sm:col-span-2">
          Add education
        </Button>
      </form>
    </div>
  );
}

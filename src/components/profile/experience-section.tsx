"use client";

import { useActionState, useRef, useState } from "react";
import { addExperienceAction, deleteExperienceAction } from "@/lib/actions/profile";
import { TextField, TextAreaField, SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrashIcon } from "@/components/ui/icons";

type ExperienceItem = {
  id: string;
  employmentType: string;
  company: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
};

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  APPRENTICESHIP: "Apprenticeship",
  CONTRACT: "Contract",
};

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addExperienceAction(prev as never, formData);
    if (result?.ok) {
      formRef.current?.reset();
      setIsCurrent(false);
    }
    return result;
  }, undefined);

  const sorted = [...items].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  return (
    <div className="flex flex-col gap-4">
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No work experience or internships added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((exp) => (
            <li key={exp.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <Badge tone={exp.employmentType === "INTERNSHIP" ? "accent" : "neutral"}>
                  {EMPLOYMENT_TYPE_LABEL[exp.employmentType] ?? exp.employmentType}
                </Badge>
                <p className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{exp.title}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{exp.company}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatMonthYear(exp.startDate)} – {exp.isCurrent ? "Present" : exp.endDate ? formatMonthYear(exp.endDate) : "—"}
                </p>
              </div>
              <form action={deleteExperienceAction.bind(null, exp.id)}>
                <button type="submit" aria-label={`Remove ${exp.title} at ${exp.company}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4 sm:grid-cols-2">
        {state?.message && <p className="text-sm font-medium text-[var(--color-error)] sm:col-span-2">{state.message}</p>}
        <SelectField label="Type" name="employmentType" defaultValue="FULL_TIME" required>
          {Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <TextField label="Company / organization" name="company" required />
        <TextField label="Job title" name="title" required />
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
          I currently work here
        </label>
        <TextAreaField label="Description" name="description" optional rows={3} wrapperClassName="sm:col-span-2" />
        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start sm:col-span-2">
          Add experience
        </Button>
      </form>
    </div>
  );
}

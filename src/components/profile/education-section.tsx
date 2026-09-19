"use client";

import { useActionState, useRef, useState } from "react";
import {
  addEducationAction,
  deleteEducationAction,
  saveMandatoryEducationAction,
  type EducationState,
} from "@/lib/actions/profile";
import { TextField, SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrashIcon } from "@/components/ui/icons";
import { useProfileImport } from "@/components/profile/profile-import-context";
import type { LinkedInEducationDraft } from "@/lib/import/linkedin-parser";

type EducationItem = {
  id: string;
  level: string;
  institutionName: string;
  degree: string;
  fieldOfStudy: string | null;
  board: string | null;
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

const MANDATORY_LEVELS = ["SECONDARY", "HIGHER_SECONDARY", "UNDERGRADUATE"] as const;
const EXTRA_LEVELS = ["POSTGRADUATE", "DOCTORATE", "DIPLOMA", "CERTIFICATE_PROGRAM", "OTHER"] as const;
const DEGREE_LABEL: Record<string, string> = {
  SECONDARY: "Qualification",
  HIGHER_SECONDARY: "Qualification",
};

function requiresBoard(level: string) {
  return level === "SECONDARY" || level === "HIGHER_SECONDARY";
}

export function EducationSection({ items }: { items: EducationItem[] }) {
  const byLevel = new Map(items.map((item) => [item.level, item]));
  const extras = items.filter((item) => !MANDATORY_LEVELS.includes(item.level as (typeof MANDATORY_LEVELS)[number]));

  const { education: suggestions, dismissEducation } = useProfileImport();
  const [mandatoryPrefill, setMandatoryPrefill] = useState<Partial<Record<(typeof MANDATORY_LEVELS)[number], LinkedInEducationDraft>>>({});
  const [extraPrefill, setExtraPrefill] = useState<LinkedInEducationDraft | null>(null);

  function applySuggestion(index: number, level: string) {
    const suggestion = suggestions[index];
    if (!suggestion) return;
    if ((MANDATORY_LEVELS as readonly string[]).includes(level)) {
      if (byLevel.get(level)) return; // already filled — leave it to manual edit
      setMandatoryPrefill((prev) => ({ ...prev, [level]: suggestion }));
    } else {
      setExtraPrefill(suggestion);
    }
    dismissEducation(index);
  }

  return (
    <div className="flex flex-col gap-4">
      {suggestions.length > 0 && (
        <div className="rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] p-3">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">Found in your LinkedIn export — choose where each one belongs:</p>
          <ul className="mt-2 flex flex-col gap-2">
            {suggestions.map((s, index) => (
              <li key={`${s.institutionName}-${index}`} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-[var(--color-text-primary)]">
                  {s.degree ? `${s.degree}, ` : ""}
                  {s.institutionName}
                  {s.startYear ? ` (${s.startYear}–${s.endYear ?? ""})` : ""}
                </span>
                <select
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 py-1 text-xs"
                  defaultValue=""
                  onChange={(e) => e.target.value && applySuggestion(index, e.target.value)}
                >
                  <option value="" disabled>
                    Use as…
                  </option>
                  {[...MANDATORY_LEVELS, ...EXTRA_LEVELS].map((level) => (
                    <option key={level} value={level}>
                      {LEVEL_LABEL[level]}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => dismissEducation(index)} className="text-xs text-[var(--color-text-muted)] underline">
                  Dismiss
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {MANDATORY_LEVELS.map((level) => (
        <MandatoryEducationCard
          key={level}
          level={level}
          item={byLevel.get(level) ?? null}
          prefill={mandatoryPrefill[level]}
          onPrefillConsumed={() => setMandatoryPrefill((prev) => ({ ...prev, [level]: undefined }))}
        />
      ))}

      {extras.length > 0 && (
        <ul className="flex flex-col gap-2">
          {extras.map((edu) => (
            <li key={edu.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <Badge tone="neutral">{LEVEL_LABEL[edu.level] ?? edu.level}</Badge>
                <p className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">
                  {edu.degree}, {edu.fieldOfStudy}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">{edu.institutionName}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {edu.startYear} – {edu.endYear} · {edu.gradeValue}
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

      <AddExtraEducationForm prefill={extraPrefill} onPrefillConsumed={() => setExtraPrefill(null)} />
    </div>
  );
}

function MandatoryEducationCard({
  level,
  item,
  prefill,
  onPrefillConsumed,
}: {
  level: (typeof MANDATORY_LEVELS)[number];
  item: EducationItem | null;
  prefill?: LinkedInEducationDraft;
  onPrefillConsumed: () => void;
}) {
  const [editing, setEditing] = useState(!item || !!prefill);
  const [appliedPrefill, setAppliedPrefill] = useState(prefill);
  if (prefill && prefill !== appliedPrefill) {
    setAppliedPrefill(prefill);
    setEditing(true);
  }

  const boundAction = saveMandatoryEducationAction.bind(null, level);
  const [state, formAction, isPending] = useActionState(async (prev: EducationState, formData: FormData) => {
    const result = await boundAction(prev, formData);
    if (result?.ok) {
      setEditing(false);
      onPrefillConsumed();
    }
    return result;
  }, undefined);
  const errors = state?.fieldErrors ?? {};

  if (!editing && item) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
        <div>
          <Badge tone="accent">{LEVEL_LABEL[level]}</Badge>
          <p className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">
            {item.degree}
            {item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ""}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">{item.institutionName}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {item.board ? `${item.board} · ` : ""}
            {item.startYear} – {item.endYear} · {item.gradeValue}
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
    );
  }

  return (
    <form
      key={prefill ? `prefill-${level}` : level}
      action={formAction}
      className="grid grid-cols-1 gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <Badge tone="accent">{LEVEL_LABEL[level]} · required</Badge>
        {prefill && <span className="ml-2 text-xs text-[var(--color-text-muted)]">Prefilled from LinkedIn — fill in the rest and review before saving.</span>}
      </div>
      {state?.message && !state.ok && <p className="text-sm font-medium text-[var(--color-error)] sm:col-span-2">{state.message}</p>}
      <TextField label="Institution" name="institutionName" defaultValue={prefill?.institutionName ?? item?.institutionName} error={errors.institutionName} />
      <TextField
        label={DEGREE_LABEL[level] ?? "Degree / qualification"}
        name="degree"
        defaultValue={prefill?.degree ?? item?.degree}
        placeholder={level === "UNDERGRADUATE" ? "e.g. B.Tech" : "e.g. SSC / State Board"}
        error={errors.degree}
      />
      <TextField
        label="Field of study / stream"
        name="fieldOfStudy"
        defaultValue={prefill?.fieldOfStudy ?? item?.fieldOfStudy ?? ""}
        placeholder={level === "UNDERGRADUATE" ? "e.g. Computer Science" : "e.g. Science, Commerce, General"}
        error={errors.fieldOfStudy}
      />
      {requiresBoard(level) && (
        <TextField label="Board" name="board" defaultValue={item?.board ?? ""} placeholder="e.g. CBSE, ICSE, State Board" error={errors.board} />
      )}
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Start year" name="startYear" type="number" min={1970} max={2100} defaultValue={prefill?.startYear ?? item?.startYear ?? undefined} error={errors.startYear} />
        <TextField label="End year" name="endYear" type="number" min={1970} max={2100} defaultValue={prefill?.endYear ?? item?.endYear ?? undefined} error={errors.endYear} />
      </div>
      <TextField label="Grade / percentage / CGPA" name="gradeValue" defaultValue={item?.gradeValue ?? ""} placeholder="e.g. 8.4 CGPA" error={errors.gradeValue} />
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" variant="secondary" size="sm" loading={isPending}>
          Save {LEVEL_LABEL[level]}
        </Button>
        {item && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(false);
              onPrefillConsumed();
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function AddExtraEducationForm({ prefill, onPrefillConsumed }: { prefill: LinkedInEducationDraft | null; onPrefillConsumed: () => void }) {
  const [open, setOpen] = useState(false);
  const [appliedPrefill, setAppliedPrefill] = useState(prefill);
  if (prefill && prefill !== appliedPrefill) {
    setAppliedPrefill(prefill);
    setOpen(true);
  }

  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: EducationState, formData: FormData) => {
    const result = await addEducationAction(prev, formData);
    if (result?.ok) {
      formRef.current?.reset();
      setOpen(false);
      onPrefillConsumed();
    }
    return result;
  }, undefined);
  const errors = state?.fieldErrors ?? {};

  if (!open) {
    return (
      <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => setOpen(true)}>
        Add education
      </Button>
    );
  }

  return (
    <form
      key={prefill ? `prefill-${prefill.institutionName}` : "extra"}
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4 sm:grid-cols-2"
    >
      {prefill && <p className="text-xs text-[var(--color-text-muted)] sm:col-span-2">Prefilled from LinkedIn — fill in the rest and review before saving.</p>}
      {state?.message && !state.ok && <p className="text-sm font-medium text-[var(--color-error)] sm:col-span-2">{state.message}</p>}
      <SelectField label="Level" name="level" defaultValue="POSTGRADUATE" error={errors.level}>
        {EXTRA_LEVELS.map((value) => (
          <option key={value} value={value}>
            {LEVEL_LABEL[value]}
          </option>
        ))}
      </SelectField>
      <TextField label="Institution" name="institutionName" defaultValue={prefill?.institutionName} error={errors.institutionName} />
      <TextField label="Degree / qualification" name="degree" defaultValue={prefill?.degree} placeholder="e.g. M.Tech" error={errors.degree} />
      <TextField label="Field of study" name="fieldOfStudy" defaultValue={prefill?.fieldOfStudy} error={errors.fieldOfStudy} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Start year" name="startYear" type="number" min={1970} max={2100} defaultValue={prefill?.startYear} error={errors.startYear} />
        <TextField label="End year" name="endYear" type="number" min={1970} max={2100} defaultValue={prefill?.endYear} error={errors.endYear} />
      </div>
      <TextField label="Grade / percentage / CGPA" name="gradeValue" placeholder="e.g. 8.4 CGPA" error={errors.gradeValue} />
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" variant="secondary" size="sm" loading={isPending}>
          Add education
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            onPrefillConsumed();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

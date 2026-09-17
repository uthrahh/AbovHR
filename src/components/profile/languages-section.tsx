"use client";

import { useActionState, useRef } from "react";
import { addLanguageAction, deleteLanguageAction } from "@/lib/actions/profile";
import { TextField, SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";

type LanguageItem = { id: string; name: string; proficiency: string };

const PROFICIENCY_LABEL: Record<string, string> = {
  BASIC: "Basic",
  CONVERSATIONAL: "Conversational",
  FLUENT: "Fluent",
  NATIVE: "Native",
};

export function LanguagesSection({ items }: { items: LanguageItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addLanguageAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No languages added yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {items.map((lang) => (
            <li key={lang.id} className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface-sunken)] py-1 pl-3 pr-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
              {lang.name}
              <span className="text-xs font-normal text-[var(--color-text-muted)]">· {PROFICIENCY_LABEL[lang.proficiency]}</span>
              <form action={deleteLanguageAction.bind(null, lang.id)}>
                <button type="submit" aria-label={`Remove ${lang.name}`} className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10">
                  <CloseIcon width={12} height={12} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4">
        {state?.message && <p className="w-full text-sm font-medium text-[var(--color-error)]">{state.message}</p>}
        <TextField label="Language" name="name" placeholder="e.g. Hindi" required />
        <SelectField label="Proficiency" name="proficiency" defaultValue="CONVERSATIONAL">
          <option value="BASIC">Basic</option>
          <option value="CONVERSATIONAL">Conversational</option>
          <option value="FLUENT">Fluent</option>
          <option value="NATIVE">Native</option>
        </SelectField>
        <Button type="submit" variant="secondary" size="sm" loading={isPending}>
          Add language
        </Button>
      </form>
    </div>
  );
}

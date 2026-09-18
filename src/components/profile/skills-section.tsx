"use client";

import { useActionState, useRef } from "react";
import { addSkillAction, removeSkillAction } from "@/lib/actions/profile";
import { SelectField } from "@/components/ui/field";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";

type SkillItem = { skillId: string; name: string; proficiency: string };

const PROFICIENCY_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export function SkillsSection({ items, catalog }: { items: SkillItem[]; catalog: ComboboxOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addSkillAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No skills added yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {items.map((skill) => (
            <li key={skill.skillId} className="flex items-center gap-1.5 rounded-full bg-[var(--color-accent-subtle-bg)] py-1 pl-3 pr-1.5 text-sm font-medium text-[var(--color-accent-text)]">
              {skill.name}
              <span className="text-xs font-normal opacity-75">· {PROFICIENCY_LABEL[skill.proficiency]}</span>
              <form action={removeSkillAction.bind(null, skill.skillId)}>
                <button type="submit" aria-label={`Remove ${skill.name}`} className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10">
                  <CloseIcon width={12} height={12} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4">
        {state?.message && <p className="w-full text-sm font-medium text-[var(--color-error)]">{state.message}</p>}
        <div className="w-56">
          <Combobox key={items.length} name="skillName" label="Skill" options={catalog} placeholder="Start typing, e.g. SQL" required />
        </div>
        <SelectField label="Proficiency" name="proficiency" defaultValue="INTERMEDIATE">
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
          <option value="EXPERT">Expert</option>
        </SelectField>
        <Button type="submit" variant="secondary" size="sm" loading={isPending}>
          Add skill
        </Button>
      </form>
    </div>
  );
}

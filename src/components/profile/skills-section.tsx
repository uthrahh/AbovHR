"use client";

import { useActionState, useRef, useTransition } from "react";
import { addSkillsAction, removeSkillAction } from "@/lib/actions/profile";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { useProfileImport } from "@/components/profile/profile-import-context";

type SkillItem = { skillId: string; name: string };

export function SkillsSection({ items, catalog }: { items: SkillItem[]; catalog: { value: string; label: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addSkillsAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  const { skills: importedSkills, dismissSkill } = useProfileImport();
  const [isAddingSuggested, startAddingSuggested] = useTransition();
  const existingNames = new Set(items.map((s) => s.name.toLowerCase()));
  const suggestions = importedSkills.filter((s) => !existingNames.has(s.toLowerCase()));

  function addSuggestion(name: string) {
    startAddingSuggested(async () => {
      const fd = new FormData();
      fd.append("skillNames", name);
      const result = await addSkillsAction(undefined, fd);
      if (result?.ok) dismissSkill(name);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {suggestions.length > 0 && (
        <div className="rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] p-3">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">Found in your import — add the ones that apply:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  disabled={isAddingSuggested}
                  onClick={() => addSuggestion(name)}
                  className="rounded-full border border-[var(--color-border-strong)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent-subtle-bg)] hover:text-[var(--color-accent-text)] disabled:opacity-50"
                >
                  + {name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No skills added yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {items.map((skill) => (
            <li key={skill.skillId} className="flex items-center gap-1.5 rounded-full bg-[var(--color-accent-subtle-bg)] py-1 pl-3 pr-1.5 text-sm font-medium text-[var(--color-accent-text)]">
              {skill.name}
              <form action={removeSkillAction.bind(null, skill.skillId)}>
                <button type="submit" aria-label={`Remove ${skill.name}`} className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10">
                  <CloseIcon width={12} height={12} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form key={items.length} ref={formRef} action={formAction} className="flex flex-col items-start gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4 sm:flex-row sm:items-end">
        <div className="w-full flex-1">
          <MultiCombobox
            name="skillNames"
            label="Add skills"
            options={catalog}
            allowCustom
            placeholder="Type to search or add a skill…"
            hint="Search the catalog, or add one that isn't listed yet."
            error={state?.ok === false ? state.message : undefined}
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" loading={isPending}>
          Add skills
        </Button>
      </form>
    </div>
  );
}

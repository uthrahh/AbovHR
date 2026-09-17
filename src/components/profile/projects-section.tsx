"use client";

import { useActionState, useRef } from "react";
import { addProjectAction, deleteProjectAction } from "@/lib/actions/profile";
import { TextField, TextAreaField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TrashIcon, ExternalLinkIcon } from "@/components/ui/icons";

type ProjectItem = { id: string; title: string; description: string | null; url: string | null; skillsUsed: string[] };

export function ProjectsSection({ items }: { items: ProjectItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addProjectAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No projects added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((project) => (
            <li key={project.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{project.title}</p>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Open link for ${project.title}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)]">
                      <ExternalLinkIcon width={13} height={13} />
                    </a>
                  )}
                </div>
                {project.description && <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{project.description}</p>}
                {project.skillsUsed.length > 0 && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{project.skillsUsed.join(", ")}</p>}
              </div>
              <form action={deleteProjectAction.bind(null, project.id)}>
                <button type="submit" aria-label={`Remove ${project.title}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4 sm:grid-cols-2">
        {state?.message && <p className="text-sm font-medium text-[var(--color-error)] sm:col-span-2">{state.message}</p>}
        <TextField label="Project title" name="title" required />
        <TextField label="Link" name="url" type="url" placeholder="https://" optional />
        <TextAreaField label="Description" name="description" optional rows={2} wrapperClassName="sm:col-span-2" />
        <TextField label="Skills used" name="skillsUsed" placeholder="Comma-separated" optional wrapperClassName="sm:col-span-2" />
        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start sm:col-span-2">
          Add project
        </Button>
      </form>
    </div>
  );
}

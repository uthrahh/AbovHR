"use client";

import { useActionState, useRef } from "react";
import { addLinkAction, deleteLinkAction } from "@/lib/actions/profile";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TrashIcon, ExternalLinkIcon } from "@/components/ui/icons";

type LinkItem = { id: string; label: string; url: string };

export function LinksSection({ items }: { items: LinkItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addLinkAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No other links added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((link) => (
            <li key={link.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-[var(--color-accent-text)]">
                <ExternalLinkIcon width={13} height={13} className="shrink-0" />
                <span className="truncate">{link.label}</span>
              </a>
              <form action={deleteLinkAction.bind(null, link.id)}>
                <button type="submit" aria-label={`Remove ${link.label}`} className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4">
        {state?.message && <p className="w-full text-sm font-medium text-[var(--color-error)]">{state.message}</p>}
        <TextField label="Label" name="label" placeholder="e.g. Behance, LeetCode" required />
        <TextField label="URL" name="url" type="url" placeholder="https://" required className="min-w-[14rem] flex-1" />
        <Button type="submit" variant="secondary" size="sm" loading={isPending}>
          Add link
        </Button>
      </form>
    </div>
  );
}

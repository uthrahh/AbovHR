"use client";

import { useActionState, useRef } from "react";
import { addPublicationAction, deletePublicationAction } from "@/lib/actions/profile";
import { TextField, TextAreaField, SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrashIcon, ExternalLinkIcon } from "@/components/ui/icons";

type PublicationItem = {
  id: string;
  title: string;
  publicationType: string;
  venue: string | null;
  authors: string | null;
  publishedDate: Date | null;
  url: string | null;
  description: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  RESEARCH_PAPER: "Research paper",
  ARTICLE: "Article",
  BOOK_CHAPTER: "Book chapter",
  PATENT: "Patent",
  CONFERENCE_PAPER: "Conference paper",
  OTHER: "Other",
};

export function PublicationsSection({ items }: { items: PublicationItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addPublicationAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No research papers or publications added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((pub) => (
            <li key={pub.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <Badge tone="neutral">{TYPE_LABEL[pub.publicationType] ?? pub.publicationType}</Badge>
                <div className="mt-1 flex items-center gap-1.5">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{pub.title}</p>
                  {pub.url && (
                    <a href={pub.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${pub.title}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)]">
                      <ExternalLinkIcon width={12} height={12} />
                    </a>
                  )}
                </div>
                {pub.venue && <p className="text-sm text-[var(--color-text-secondary)]">{pub.venue}</p>}
                {pub.publishedDate && (
                  <p className="text-xs text-[var(--color-text-muted)]">{pub.publishedDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                )}
              </div>
              <form action={deletePublicationAction.bind(null, pub.id)}>
                <button type="submit" aria-label={`Remove ${pub.title}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4 sm:grid-cols-2">
        {state?.message && <p className="text-sm font-medium text-[var(--color-error)] sm:col-span-2">{state.message}</p>}
        <SelectField label="Type" name="publicationType" defaultValue="RESEARCH_PAPER" required>
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <TextField label="Title" name="title" required />
        <TextField label="Venue / journal" name="venue" optional />
        <TextField label="Published date" name="publishedDate" type="date" optional />
        <TextField label="Authors" name="authors" placeholder="Comma-separated" optional wrapperClassName="sm:col-span-2" />
        <TextField label="Link" name="url" type="url" placeholder="https://" optional wrapperClassName="sm:col-span-2" />
        <TextAreaField label="Description" name="description" optional rows={3} wrapperClassName="sm:col-span-2" />
        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start sm:col-span-2">
          Add publication
        </Button>
      </form>
    </div>
  );
}

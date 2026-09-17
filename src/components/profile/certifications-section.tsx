"use client";

import { useActionState, useRef } from "react";
import { addCertificationAction, deleteCertificationAction } from "@/lib/actions/profile";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TrashIcon, ExternalLinkIcon } from "@/components/ui/icons";

type CertificationItem = { id: string; name: string; issuer: string; issueDate: Date | null; credentialUrl: string | null };

export function CertificationsSection({ items }: { items: CertificationItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await addCertificationAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No certifications added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((cert) => (
            <li key={cert.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{cert.name}</p>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open credential for ${cert.name}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)]">
                      <ExternalLinkIcon width={13} height={13} />
                    </a>
                  )}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {cert.issuer}
                  {cert.issueDate && ` · ${cert.issueDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`}
                </p>
              </div>
              <form action={deleteCertificationAction.bind(null, cert.id)}>
                <button type="submit" aria-label={`Remove ${cert.name}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4 sm:grid-cols-2">
        {state?.message && <p className="text-sm font-medium text-[var(--color-error)] sm:col-span-2">{state.message}</p>}
        <TextField label="Certification name" name="name" required />
        <TextField label="Issuer" name="issuer" required />
        <TextField label="Issue date" name="issueDate" type="date" optional />
        <TextField label="Credential link" name="credentialUrl" type="url" placeholder="https://" optional />
        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start sm:col-span-2">
          Add certification
        </Button>
      </form>
    </div>
  );
}

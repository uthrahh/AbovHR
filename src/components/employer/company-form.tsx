"use client";

import { useActionState } from "react";
import { updateCompanyAction } from "@/lib/actions/employer-company";
import { TextField, TextAreaField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function CompanyForm({
  defaults,
}: {
  defaults: { name: string; about: string; industry: string; websiteUrl: string; sizeRange: string; headquartersCity: string };
}) {
  const [state, formAction, isPending] = useActionState(updateCompanyAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.message && (
        <p role="status" className={state.ok ? "text-sm font-medium text-[var(--color-success)]" : "text-sm font-medium text-[var(--color-error)]"}>
          {state.message}
        </p>
      )}

      <TextField label="Company name" name="name" defaultValue={defaults.name} required />
      <TextAreaField label="About" name="about" defaultValue={defaults.about} rows={4} optional />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Industry" name="industry" defaultValue={defaults.industry} optional />
        <TextField label="Company size" name="sizeRange" defaultValue={defaults.sizeRange} placeholder="e.g. 51-200" optional />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Website" name="websiteUrl" type="url" defaultValue={defaults.websiteUrl} placeholder="https://" optional />
        <TextField label="Headquarters city" name="headquartersCity" defaultValue={defaults.headquartersCity} optional />
      </div>

      <Button type="submit" loading={isPending} className="self-start">
        Save changes
      </Button>
    </form>
  );
}

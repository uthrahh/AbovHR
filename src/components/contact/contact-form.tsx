"use client";

import { useActionState, useRef } from "react";
import { submitContactFormAction } from "@/lib/actions/contact";
import { TextField, TextAreaField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await submitContactFormAction(prev as never, formData);
    if (result?.ok) formRef.current?.reset();
    return result;
  }, undefined);

  if (state?.ok) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success-subtle)] px-4 py-3 text-sm font-medium text-[var(--color-success)]">
        <CheckIcon width={18} height={18} />
        {state.message}
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4" noValidate>
      {/* Honeypot field — hidden from sighted and screen-reader users, catches simple bots */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="company_website">Leave this field empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state?.message && !state.ok && (
        <p role="alert" className="text-sm font-medium text-[var(--color-error)]">
          {state.message}
        </p>
      )}

      <TextField label="Name" name="name" autoComplete="name" required />
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <TextField label="Subject" name="subject" required />
      <TextAreaField label="Message" name="message" rows={5} required />

      <Button type="submit" loading={isPending} className="self-start">
        Send message
      </Button>
    </form>
  );
}

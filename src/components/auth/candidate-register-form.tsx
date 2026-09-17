"use client";

import { useActionState } from "react";
import Link from "next/link";
import { candidateRegisterAction } from "@/lib/actions/auth";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function CandidateRegisterForm() {
  const [state, formAction, isPending] = useActionState(candidateRegisterAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state?.error && (
        <p role="alert" className="rounded-[var(--radius-sm)] bg-[var(--color-error-subtle)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-error)]">
          {state.error}
        </p>
      )}

      <TextField label="Full name" name="name" autoComplete="name" required error={state?.fieldErrors?.name} />
      <TextField label="Email" name="email" type="email" autoComplete="email" required error={state?.fieldErrors?.email} />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 10 characters."
        error={state?.fieldErrors?.password}
      />

      <label className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)]">
        <input type="checkbox" name="termsAccepted" required className="mt-0.5 h-4 w-4 accent-[var(--color-accent-text)]" />
        <span>
          I agree to the{" "}
          <Link href="/legal/terms" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy-policy" className="underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <label className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)]">
        <input type="checkbox" name="marketingConsent" className="mt-0.5 h-4 w-4 accent-[var(--color-accent-text)]" />
        <span>Send me occasional emails about new features and career resources (optional).</span>
      </label>

      <Button type="submit" loading={isPending} className="mt-1">
        Create account
      </Button>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

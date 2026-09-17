"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/lib/actions/auth";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(signInAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {state?.error && (
        <p role="alert" className="rounded-[var(--radius-sm)] bg-[var(--color-error-subtle)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-error)]">
          {state.error}
        </p>
      )}

      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required />

      <Button type="submit" loading={isPending} className="mt-2">
        Sign in
      </Button>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium underline">
          Create one
        </Link>
      </p>
    </form>
  );
}

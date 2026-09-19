"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signInAction } from "@/lib/actions/auth";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(signInAction, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const errors = validate(email, password);
  const isValid = Object.keys(errors).length === 0;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {state?.error && (
        <p role="alert" className="rounded-[var(--radius-sm)] bg-[var(--color-error-subtle)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-error)]">
          {state.error}
        </p>
      )}

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={touched.email ? errors.email : undefined}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        error={touched.password ? errors.password : undefined}
      />

      <Button type="submit" loading={isPending} disabled={!isValid} className="mt-2">
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

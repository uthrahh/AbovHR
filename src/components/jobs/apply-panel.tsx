"use client";

import { useActionState } from "react";
import Link from "next/link";
import { applyToJobAction } from "@/lib/actions/applications";
import { Button, LinkButton } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";

export function ApplyPanel({
  jobId,
  jobSlug,
  isAuthenticated,
  isCandidate,
  alreadyApplied,
}: {
  jobId: string;
  jobSlug: string;
  isAuthenticated: boolean;
  isCandidate: boolean;
  alreadyApplied: boolean;
}) {
  const [state, formAction, isPending] = useActionState(applyToJobAction, undefined);

  if (alreadyApplied || state?.ok) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-success-subtle)] px-4 py-3 text-sm font-medium text-[var(--color-success)]">
        <CheckIcon width={18} height={18} />
        {state?.message ?? "You've applied to this job."}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LinkButton href={`/sign-in?next=${encodeURIComponent(`/jobs/${jobSlug}`)}`} size="lg" className="w-full">
        Sign in to apply
      </LinkButton>
    );
  }

  if (!isCandidate) {
    return (
      <p className="rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
        Sign in with a candidate account to apply to this role.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      {state?.message && !state.ok && (
        <p role="alert" className="text-sm font-medium text-[var(--color-error)]">
          {state.message}
        </p>
      )}
      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Apply now
      </Button>
      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Uses your Abov profile and primary resume.{" "}
        <Link href="/dashboard/profile" className="underline">
          Review your profile
        </Link>
      </p>
    </form>
  );
}

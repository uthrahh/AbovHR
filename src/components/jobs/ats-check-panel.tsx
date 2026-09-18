"use client";

import { useActionState } from "react";
import Link from "next/link";
import { checkAtsScoreAction } from "@/lib/actions/ats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TargetIcon, CheckIcon, AlertIcon } from "@/components/ui/icons";
import { PROFILE_SECTION_LABELS } from "@/lib/profile/sections";

export function AtsCheckPanel({
  jobId,
  isAuthenticated,
  isCandidate,
}: {
  jobId: string;
  isAuthenticated: boolean;
  isCandidate: boolean;
}) {
  const [state, formAction, isPending] = useActionState(checkAtsScoreAction, undefined);

  if (!isAuthenticated || !isCandidate) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-2 text-[var(--color-accent-text)]">
          <TargetIcon width={18} height={18} />
          <h2 className="text-sm font-semibold">ATS score check</h2>
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {isAuthenticated
            ? "Sign in with a candidate account to check how your profile matches this job."
            : "Sign in to check how your profile matches this job's description before you apply."}
        </p>
        {!isAuthenticated && (
          <Link href={`/sign-in?next=/jobs`} className="mt-2 inline-block text-sm font-medium text-[var(--color-accent-text)] underline">
            Sign in
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center gap-2 text-[var(--color-accent-text)]">
        <TargetIcon width={18} height={18} />
        <h2 className="text-sm font-semibold">ATS score check</h2>
      </div>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Compares this job&rsquo;s description against the profile sections it requests — not a resume file. No data outside those
        sections is read.
      </p>

      {!state && (
        <form action={formAction} className="mt-3">
          <input type="hidden" name="jobId" value={jobId} />
          <Button type="submit" variant="secondary" size="sm" loading={isPending} className="w-full">
            Check my ATS score
          </Button>
        </form>
      )}

      {state && !state.ok && (
        <div className="mt-3">
          <p className="text-sm font-medium text-[var(--color-error)]">{state.message}</p>
        </div>
      )}

      {state && state.ok && (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl text-[var(--color-text-primary)]">{state.result.score}%</span>
            <span className="text-xs text-[var(--color-text-muted)]">ATS keyword match</span>
          </div>
          <div className="mt-2">
            <ProgressBar percentage={state.result.score} label="ATS score" />
          </div>

          {state.result.matchedSkills.length + state.result.missingSkills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Required skills</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {state.result.matchedSkills.map((s) => (
                  <Badge key={s} tone="success">
                    <CheckIcon width={11} height={11} /> {s}
                  </Badge>
                ))}
                {state.result.missingSkills.map((s) => (
                  <Badge key={s} tone="warning">
                    <AlertIcon width={11} height={11} /> {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {state.result.missingKeywords.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Keywords from this listing not found in your shared sections
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {state.result.missingKeywords.slice(0, 10).map((kw) => (
                  <Badge key={kw} tone="neutral">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-[var(--color-text-muted)]">
            Based on: {state.result.sectionsUsed.map((s) => PROFILE_SECTION_LABELS[s]).join(", ") || "no shared sections"}.
          </p>
        </div>
      )}
    </div>
  );
}

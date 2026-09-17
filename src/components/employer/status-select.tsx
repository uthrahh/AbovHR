"use client";

import { useTransition } from "react";
import { updateApplicationStatusAction } from "@/lib/actions/employer-applications";

const STATUSES = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const;

const LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export function StatusSelect({ applicationId, currentStatus }: { applicationId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={currentStatus}
      disabled={isPending || currentStatus === "WITHDRAWN"}
      aria-label="Application status"
      onChange={(e) => {
        const formData = new FormData();
        formData.set("status", e.target.value);
        startTransition(() => updateApplicationStatusAction(applicationId, formData));
      }}
      className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2.5 py-1.5 text-sm text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] disabled:opacity-60"
    >
      {currentStatus === "WITHDRAWN" && <option value="WITHDRAWN">Withdrawn</option>}
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {LABELS[status]}
        </option>
      ))}
    </select>
  );
}

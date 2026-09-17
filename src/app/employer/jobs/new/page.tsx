import type { Metadata } from "next";
import { requireEmployerMembership } from "@/lib/auth/employer";
import { createJobAction } from "@/lib/actions/employer-jobs";
import { JobForm } from "@/components/employer/job-form";

export const metadata: Metadata = { title: "Post a job" };

export default async function NewJobPage() {
  await requireEmployerMembership();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Post a job</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Save as a draft to keep editing, or publish to make it visible to candidates immediately.
      </p>
      <div className="mt-6">
        <JobForm mode="create" onSubmitDraft={createJobAction.bind(null, "DRAFT")} onSubmitPublish={createJobAction.bind(null, "PUBLISHED")} />
      </div>
    </div>
  );
}

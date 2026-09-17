import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { DataRequestForm } from "@/components/legal/data-request-form";

export const metadata: Metadata = { title: "Manage your data" };

export default async function DataRequestPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Manage your data</h1>
      <p className="mt-2 text-base text-[var(--color-text-secondary)]">
        Request a copy of your data, or ask us to delete your account. See our{" "}
        <Link href="/legal/privacy-policy" className="underline">
          privacy policy
        </Link>{" "}
        for how we handle these requests.
      </p>

      {!session?.user ? (
        <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Sign in to submit a data request from your account, or use the{" "}
            <Link href="/contact" className="underline">
              contact page
            </Link>{" "}
            if you no longer have access to your account.
          </p>
          <Link href="/sign-in?next=/data-request" className="mt-3 inline-block text-sm font-medium text-[var(--color-accent-text)] underline">
            Sign in
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-display text-lg text-[var(--color-text-primary)]">Export your data</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Get a copy of your profile, applications, saved jobs, and learning progress.
            </p>
            <div className="mt-3">
              <DataRequestForm type="EXPORT" label="Request data export" />
            </div>
          </section>

          <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-display text-lg text-[var(--color-text-primary)]">Delete your account</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">This removes:</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-[var(--color-text-secondary)]">
              <li>Your profile, resumes, and learning progress</li>
              <li>Saved jobs and job alerts</li>
              <li>Messages you've sent through the platform</li>
            </ul>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Applications you've submitted may be retained by the employer you applied to, separately from your Abov
              account, consistent with their own record-keeping obligations. This action can't be undone once processed.
            </p>
            <div className="mt-3">
              <DataRequestForm type="DELETE" label="Request account deletion" />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

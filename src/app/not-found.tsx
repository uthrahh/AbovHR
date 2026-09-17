import Link from "next/link";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="font-display text-6xl text-[var(--color-accent-decorative)]">404</p>
      <h1 className="mt-3 font-display text-2xl text-[var(--color-text-primary)]">We couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-md text-base text-[var(--color-text-secondary)]">
        The page may have moved, or the link might be out of date. Try searching for a job, or head back to the homepage.
      </p>

      <div className="mt-7 w-full max-w-lg">
        <JobSearchBar />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <LinkButton href="/" variant="secondary">
          Go to homepage
        </LinkButton>
        <LinkButton href="/jobs" variant="ghost">
          Browse all jobs
        </LinkButton>
        <Link href="/contact" className="text-sm font-medium text-[var(--color-accent-text)] underline">
          Contact support
        </Link>
      </div>
    </div>
  );
}

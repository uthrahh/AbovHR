"use client";

import { useEffect } from "react";
import { LinkButton, Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Logged client-side for now; a production build would forward this to
    // server-side error tracking (see docs/architecture/observability.md).
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <AlertIcon width={32} height={32} className="text-[var(--color-warning)]" />
      <h1 className="mt-3 font-display text-xl text-[var(--color-text-primary)]">Something went wrong</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        We hit an unexpected error loading this page. You can try again, or head back to the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} variant="secondary">
          Try again
        </Button>
        <LinkButton href="/">Go to homepage</LinkButton>
      </div>
    </div>
  );
}

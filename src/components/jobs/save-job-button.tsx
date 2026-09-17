"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookmarkIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function SaveJobButton({
  jobId,
  initialSaved,
  isAuthenticated,
}: {
  jobId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const next = !saved;
    setSaved(next); // optimistic
    startTransition(async () => {
      try {
        const res = await fetch("/api/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSaved(data.saved);
      } catch {
        setSaved(!next); // revert on failure
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? "Remove from saved jobs" : "Save job"}
      aria-pressed={saved}
      className={cn(
        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-accent-text)]",
        saved && "text-[var(--color-accent-text)]"
      )}
    >
      <BookmarkIcon width={17} height={17} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

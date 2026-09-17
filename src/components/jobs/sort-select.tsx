"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "relevance", label: "Most relevant" },
  { value: "date", label: "Newest" },
  { value: "salary", label: "Highest salary" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get("sort") ?? "relevance";

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="job-sort" className="text-sm text-[var(--color-text-secondary)]">
        Sort by
      </label>
      <select
        id="job-sort"
        value={value}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", e.target.value);
          params.delete("page");
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

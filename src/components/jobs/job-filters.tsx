"use client";

import { useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterIcon, CloseIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "APPRENTICESHIP", label: "Apprenticeship" },
  { value: "CONTRACT", label: "Contract" },
];

const WORK_MODES = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "OFFICE", label: "On-site" },
  { value: "FIELD", label: "Field" },
];

const DATE_POSTED = [
  { value: "", label: "Any time" },
  { value: "24h", label: "Past 24 hours" },
  { value: "7d", label: "Past week" },
  { value: "30d", label: "Past month" },
];

function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getAll = useCallback((key: string) => searchParams.getAll(key), [searchParams]);
  const get = useCallback((key: string) => searchParams.get(key) ?? "", [searchParams]);

  const setMulti = useCallback(
    (key: string, value: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = new Set(params.getAll(key));
      if (checked) current.add(value);
      else current.delete(value);
      params.delete(key);
      current.forEach((v) => params.append(key, v));
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setSingle = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    ["employmentType", "workMode", "fresherFriendly", "datePosted"].forEach((k) => params.delete(k));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return { getAll, get, setMulti, setSingle, clearAll };
}

function FilterGroups() {
  const { getAll, get, setMulti, setSingle } = useFilterParams();
  const employmentTypes = getAll("employmentType");
  const workModes = getAll("workMode");
  const fresherFriendly = get("fresherFriendly") === "true";
  const datePosted = get("datePosted");

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)]">Employment type</legend>
        <div className="mt-2 flex flex-col gap-2">
          {EMPLOYMENT_TYPES.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={employmentTypes.includes(opt.value)}
                onChange={(e) => setMulti("employmentType", opt.value, e.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent-text)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)]">Work mode</legend>
        <div className="mt-2 flex flex-col gap-2">
          {WORK_MODES.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={workModes.includes(opt.value)}
                onChange={(e) => setMulti("workMode", opt.value, e.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent-text)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)]">Date posted</legend>
        <div className="mt-2 flex flex-col gap-2">
          {DATE_POSTED.map((opt) => (
            <label key={opt.value || "any"} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input
                type="radio"
                name="datePosted"
                checked={datePosted === opt.value}
                onChange={() => setSingle("datePosted", opt.value)}
                className="h-4 w-4 accent-[var(--color-accent-text)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
        <input
          type="checkbox"
          checked={fresherFriendly}
          onChange={(e) => setSingle("fresherFriendly", e.target.checked ? "true" : "")}
          className="h-4 w-4 accent-[var(--color-accent-text)]"
        />
        Fresher-friendly only
      </label>
    </div>
  );
}

export function JobFiltersDesktop() {
  const { clearAll } = useFilterParams();
  return (
    <aside aria-label="Job filters" className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Filters</h2>
          <button type="button" onClick={clearAll} className="text-xs font-medium text-[var(--color-accent-text)] underline">
            Clear all
          </button>
        </div>
        <div className="mt-4">
          <FilterGroups />
        </div>
      </div>
    </aside>
  );
}

export function JobFiltersMobile({ resultCount }: { resultCount: number }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { clearAll } = useFilterParams();

  return (
    <div className="lg:hidden">
      <Button variant="secondary" size="sm" onClick={() => dialogRef.current?.showModal()}>
        <FilterIcon width={16} height={16} />
        Filters
      </Button>

      <dialog
        ref={dialogRef}
        aria-label="Job filters"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-0 mt-auto h-[85dvh] w-full max-w-none rounded-t-[var(--radius-lg)] p-0 backdrop:bg-black/50 open:flex"
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
            <h2 className="font-display text-lg">Filters</h2>
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => dialogRef.current?.close()}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-surface-sunken)]"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FilterGroups />
          </div>
          <div className="flex gap-2 border-t border-[var(--color-border)] p-4">
            <Button variant="secondary" className="flex-1" onClick={clearAll}>
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => dialogRef.current?.close()}>
              Show {resultCount} results
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

import { SearchIcon, MapPinIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export function JobSearchBar({
  defaultQuery,
  defaultLocation,
  hiddenParams,
}: {
  defaultQuery?: string;
  defaultLocation?: string;
  hiddenParams?: Record<string, string | string[] | undefined>;
}) {
  const hiddenEntries = Object.entries(hiddenParams ?? {}).flatMap(([key, value]) => {
    if (!value) return [];
    return Array.isArray(value) ? value.map((v) => [key, v] as const) : [[key, value] as const];
  });

  return (
    <form action="/jobs" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      {hiddenEntries.map(([key, value], i) => (
        <input key={`${key}-${value}-${i}`} type="hidden" name={key} value={value} />
      ))}
      <div className="relative flex-1">
        <SearchIcon
          width={18}
          height={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <label htmlFor="job-search-q" className="sr-only">
          Job title, skill, or company
        </label>
        <input
          id="job-search-q"
          type="text"
          name="q"
          defaultValue={defaultQuery}
          placeholder="Job title, skill, or company"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-3 pl-10 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
        />
      </div>
      <div className="relative sm:w-56">
        <MapPinIcon
          width={18}
          height={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <label htmlFor="job-search-location" className="sr-only">
          Location
        </label>
        <input
          id="job-search-location"
          type="text"
          name="location"
          defaultValue={defaultLocation}
          placeholder="City"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-3 pl-10 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
        />
      </div>
      <Button type="submit" size="lg">
        Find opportunities
      </Button>
    </form>
  );
}

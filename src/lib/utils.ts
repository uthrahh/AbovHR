import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatSalary(min: number | null, max: number | null, currency = "INR") {
  if (!min && !max) return null;
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: "compact",
    });
    currencyFormatters.set(currency, formatter);
  }
  if (min && max) return `${formatter.format(min)} – ${formatter.format(max)}`;
  if (min) return `From ${formatter.format(min)}`;
  return `Up to ${formatter.format(max!)}`;
}

export function formatRelativeDate(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  APPRENTICESHIP: "Apprenticeship",
  CONTRACT: "Contract",
};

const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  OFFICE: "On-site",
  FIELD: "Field",
};

export function labelForEmploymentType(value: string) {
  return EMPLOYMENT_TYPE_LABELS[value] ?? value;
}

export function labelForWorkMode(value: string) {
  return WORK_MODE_LABELS[value] ?? value;
}

// Parses LinkedIn's official "Get a copy of your data" CSV export files
// (Settings & Privacy -> Data privacy -> Get a copy of your data). We never
// scrape or use OAuth against LinkedIn — the candidate exports their own data
// and uploads the CSVs they choose, so nothing beyond what they already have
// access to is read.

export type LinkedInEducationDraft = {
  institutionName: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
};

export type LinkedInExperienceDraft = {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
};

export type LinkedInImportDraft = {
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  skills: string[];
  education: LinkedInEducationDraft[];
  experience: LinkedInExperienceDraft[];
};

/** Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes, and commas inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const content = text.replace(/^﻿/, "");
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && content[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

function toRecords(csvText: string): Record<string, string>[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

function parseYear(dateLike: string | undefined): number | undefined {
  if (!dateLike) return undefined;
  const match = dateLike.match(/\d{4}/);
  return match ? Number(match[0]) : undefined;
}

export function parseLinkedInProfileCsv(csvText: string): Pick<LinkedInImportDraft, "firstName" | "lastName" | "headline" | "summary"> {
  const [row] = toRecords(csvText);
  if (!row) return {};
  return {
    firstName: row["First Name"] || undefined,
    lastName: row["Last Name"] || undefined,
    headline: row["Headline"] || undefined,
    summary: row["Summary"] || undefined,
  };
}

export function parseLinkedInEducationCsv(csvText: string): LinkedInEducationDraft[] {
  return toRecords(csvText)
    .filter((row) => row["School Name"])
    .map((row) => ({
      institutionName: row["School Name"],
      degree: row["Degree Name"] || undefined,
      fieldOfStudy: row["Field Of Study"] || undefined,
      startYear: parseYear(row["Start Date"]),
      endYear: parseYear(row["End Date"]),
    }));
}

export function parseLinkedInPositionsCsv(csvText: string): LinkedInExperienceDraft[] {
  return toRecords(csvText)
    .filter((row) => row["Company Name"] && row["Title"])
    .map((row) => ({
      company: row["Company Name"],
      title: row["Title"],
      startDate: row["Started On"] || undefined,
      endDate: row["Finished On"] || undefined,
      isCurrent: !row["Finished On"],
    }));
}

export function parseLinkedInSkillsCsv(csvText: string): string[] {
  return toRecords(csvText)
    .map((row) => row["Name"])
    .filter((name): name is string => Boolean(name));
}

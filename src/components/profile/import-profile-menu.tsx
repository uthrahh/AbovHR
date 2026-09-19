"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProfileImport } from "@/components/profile/profile-import-context";
import type { ResumeImportDraft } from "@/lib/import/resume-parser";
import type { LinkedInImportDraft } from "@/lib/import/linkedin-parser";

type Mode = "closed" | "resume" | "linkedin";

export function ImportProfileMenu() {
  const { applyImport } = useProfileImport();
  const [mode, setMode] = useState<Mode>("closed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const resumeTextRef = useRef<HTMLTextAreaElement>(null);

  async function submitResume() {
    setError(null);
    setNotice(null);
    const file = resumeFileRef.current?.files?.[0];
    const pastedText = resumeTextRef.current?.value.trim();
    if (!file && !pastedText) {
      setError("Attach a PDF or paste your resume text below.");
      return;
    }

    const formData = new FormData();
    if (file) formData.append("resume", file);
    if (pastedText) formData.append("resumeText", pastedText);

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile/import/resume", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed.");
        return;
      }
      const draft: ResumeImportDraft = data.draft;
      applyImport({
        basicInfo: {
          headline: draft.headline,
          githubUsername: draft.githubUsername,
          linkedinUsername: draft.linkedinUsername,
          portfolioUrl: draft.portfolioUrl,
        },
        skills: draft.matchedSkills,
      });
      setNotice("Imported. Review the highlighted sections below — everything stays editable until you save.");
      setMode("closed");
    } catch {
      setError("Import failed. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitLinkedIn(formData: FormData) {
    setError(null);
    setNotice(null);
    const hasAnyFile = ["profileCsv", "educationCsv", "positionsCsv", "skillsCsv"].some((key) => {
      const file = formData.get(key);
      return file instanceof File && file.size > 0;
    });
    if (!hasAnyFile) {
      setError("Attach at least one exported CSV file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile/import/linkedin", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed.");
        return;
      }
      const draft: LinkedInImportDraft = data.draft;
      applyImport({
        basicInfo: { firstName: draft.firstName, lastName: draft.lastName, headline: draft.headline, summary: draft.summary },
        skills: draft.skills,
        education: draft.education,
        experience: draft.experience,
      });
      setNotice("Imported. Review the highlighted sections below — everything stays editable until you save.");
      setMode("closed");
    } catch {
      setError("Import failed. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Quick-fill your profile</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Import from a resume or LinkedIn export. Nothing is saved automatically — you review and edit every field first.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setMode(mode === "resume" ? "closed" : "resume")}>
            Import from resume
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setMode(mode === "linkedin" ? "closed" : "linkedin")}>
            Import from LinkedIn
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-[var(--color-error)]">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-3 text-sm font-medium text-[var(--color-success)]">
          {notice}
        </p>
      )}

      {mode === "resume" && (
        <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            We reliably pull links (GitHub / LinkedIn / portfolio), a headline, and skills we recognize from our catalog. Education
            and work history aren&apos;t auto-filled — resume layouts vary too much to guess those safely, so add them below.
          </p>
          <div>
            <label htmlFor="resume-import-file" className="text-sm font-medium text-[var(--color-text-primary)]">
              PDF resume
            </label>
            <input id="resume-import-file" ref={resumeFileRef} type="file" accept=".pdf,application/pdf" className="mt-1.5 block w-full text-sm" />
          </div>
          <div>
            <label htmlFor="resume-import-text" className="text-sm font-medium text-[var(--color-text-primary)]">
              Or paste your resume text
            </label>
            <textarea
              id="resume-import-text"
              ref={resumeTextRef}
              rows={5}
              className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)]"
              placeholder="Paste text here if your PDF doesn't parse well…"
            />
          </div>
          <Button type="button" variant="primary" size="sm" loading={isSubmitting} onClick={submitResume} className="self-start">
            Extract details
          </Button>
        </div>
      )}

      {mode === "linkedin" && (
        <form
          action={(formData) => submitLinkedIn(formData)}
          className="mt-4 flex flex-col gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-4"
        >
          <p className="text-xs text-[var(--color-text-muted)]">
            LinkedIn Settings → <em>Data privacy</em> → <em>Get a copy of your data</em>. Once your export archive arrives, unzip it
            and attach whichever CSVs you have — any subset works.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CsvInput name="profileCsv" label="Profile.csv" />
            <CsvInput name="educationCsv" label="Education.csv" />
            <CsvInput name="positionsCsv" label="Positions.csv" />
            <CsvInput name="skillsCsv" label="Skills.csv" />
          </div>
          <Button type="submit" variant="primary" size="sm" loading={isSubmitting} className="self-start">
            Extract details
          </Button>
        </form>
      )}
    </div>
  );
}

function CsvInput({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label htmlFor={`linkedin-${name}`} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
      </label>
      <input id={`linkedin-${name}`} name={name} type="file" accept=".csv,text/csv" className="mt-1.5 block w-full text-sm" />
    </div>
  );
}

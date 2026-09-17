"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPrimaryResumeAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { TrashIcon, CheckIcon } from "@/components/ui/icons";

type ResumeItem = { id: string; fileName: string; isPrimary: boolean; uploadedAt: Date; fileSizeBytes: number };

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ResumeSection({ items }: { items: ResumeItem[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resumes", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't delete this resume.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-sm font-medium text-[var(--color-error)]">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No resume uploaded yet. PDF or Word, up to 5MB.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((resume) => (
            <li key={resume.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div className="min-w-0">
                <a href={`/api/resumes/${resume.id}`} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium text-[var(--color-text-primary)] hover:underline">
                  {resume.fileName}
                </a>
                <p className="text-xs text-[var(--color-text-muted)]">{formatSize(resume.fileSizeBytes)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {resume.isPrimary ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-success)]">
                    <CheckIcon width={12} height={12} /> Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => startTransition(() => setPrimaryResumeAction(resume.id))}
                    className="text-xs font-medium text-[var(--color-accent-text)] underline"
                  >
                    Set as primary
                  </button>
                )}
                <button type="button" aria-label={`Delete ${resume.fileName}`} onClick={() => handleDelete(resume.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <input
          ref={fileInputRef}
          id="resume-upload"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="sr-only"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload resume
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import { TextField, TextAreaField, SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { JobFormState } from "@/lib/actions/employer-jobs";

type JobDefaults = {
  title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  department: string;
  employmentType: string;
  workMode: string;
  experienceMinYears: string;
  experienceMaxYears: string;
  educationRequirement: string;
  salaryMin: string;
  salaryMax: string;
  isSalaryDisclosed: boolean;
  locationCity: string;
  isFresherFriendly: boolean;
  applicationMethod: string;
  externalApplyUrl: string;
  applicationDeadline: string;
  skills: string;
};

const EMPTY_DEFAULTS: JobDefaults = {
  title: "",
  description: "",
  responsibilities: "",
  requirements: "",
  department: "",
  employmentType: "FULL_TIME",
  workMode: "OFFICE",
  experienceMinYears: "",
  experienceMaxYears: "",
  educationRequirement: "",
  salaryMin: "",
  salaryMax: "",
  isSalaryDisclosed: false,
  locationCity: "",
  isFresherFriendly: false,
  applicationMethod: "EASY_APPLY",
  externalApplyUrl: "",
  applicationDeadline: "",
  skills: "",
};

export function JobForm({
  defaults = EMPTY_DEFAULTS,
  mode,
  onSubmitDraft,
  onSubmitPublish,
  onSubmitUpdate,
}: {
  defaults?: JobDefaults;
  mode: "create" | "edit";
  onSubmitDraft?: (prevState: JobFormState, formData: FormData) => Promise<JobFormState>;
  onSubmitPublish?: (prevState: JobFormState, formData: FormData) => Promise<JobFormState>;
  onSubmitUpdate?: (prevState: JobFormState, formData: FormData) => Promise<JobFormState>;
}) {
  const [applicationMethod, setApplicationMethod] = useState(defaults.applicationMethod);

  const [draftState, draftAction, isDraftPending] = useActionState(onSubmitDraft ?? fallbackAction, undefined);
  const [publishState, publishAction, isPublishPending] = useActionState(onSubmitPublish ?? fallbackAction, undefined);
  const [updateState, updateAction, isUpdatePending] = useActionState(onSubmitUpdate ?? fallbackAction, undefined);

  const state = mode === "create" ? draftState ?? publishState : updateState;

  const fields = (
    <>
      <TextField label="Job title" name="title" defaultValue={defaults.title} required />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Employment type" name="employmentType" defaultValue={defaults.employmentType} required>
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="APPRENTICESHIP">Apprenticeship</option>
          <option value="CONTRACT">Contract</option>
        </SelectField>
        <SelectField label="Work mode" name="workMode" defaultValue={defaults.workMode} required>
          <option value="OFFICE">On-site</option>
          <option value="HYBRID">Hybrid</option>
          <option value="REMOTE">Remote</option>
          <option value="FIELD">Field</option>
        </SelectField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Department" name="department" defaultValue={defaults.department} optional />
        <TextField label="City" name="locationCity" defaultValue={defaults.locationCity} optional />
      </div>

      <TextAreaField label="Description" name="description" defaultValue={defaults.description} rows={5} required />
      <TextAreaField label="Responsibilities" name="responsibilities" defaultValue={defaults.responsibilities} rows={4} optional />
      <TextAreaField label="Requirements" name="requirements" defaultValue={defaults.requirements} rows={4} optional />

      <TextField
        label="Required skills"
        name="skills"
        defaultValue={defaults.skills}
        placeholder="Comma-separated, e.g. SQL, Excel, Power BI"
        optional
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Min experience (years)" name="experienceMinYears" type="number" min={0} max={50} defaultValue={defaults.experienceMinYears} optional />
        <TextField label="Max experience (years)" name="experienceMaxYears" type="number" min={0} max={50} defaultValue={defaults.experienceMaxYears} optional />
      </div>

      <TextField label="Education requirement" name="educationRequirement" defaultValue={defaults.educationRequirement} placeholder="e.g. Bachelor's degree, or Not required" optional />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Salary min (₹/yr)" name="salaryMin" type="number" min={0} defaultValue={defaults.salaryMin} optional />
        <TextField label="Salary max (₹/yr)" name="salaryMax" type="number" min={0} defaultValue={defaults.salaryMax} optional />
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <input type="checkbox" name="isSalaryDisclosed" defaultChecked={defaults.isSalaryDisclosed} className="h-4 w-4 accent-[var(--color-accent-text)]" />
        Show salary range publicly
      </label>

      <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <input type="checkbox" name="isFresherFriendly" defaultChecked={defaults.isFresherFriendly} className="h-4 w-4 accent-[var(--color-accent-text)]" />
        Open to freshers / no experience required
      </label>

      <SelectField
        label="Application method"
        name="applicationMethod"
        defaultValue={defaults.applicationMethod}
        onChange={(e) => setApplicationMethod(e.target.value)}
      >
        <option value="EASY_APPLY">Easy Apply (on Abov)</option>
        <option value="EXTERNAL_URL">External link</option>
      </SelectField>

      {applicationMethod === "EXTERNAL_URL" && (
        <TextField label="External application URL" name="externalApplyUrl" type="url" defaultValue={defaults.externalApplyUrl} required />
      )}

      <TextField label="Application deadline" name="applicationDeadline" type="date" defaultValue={defaults.applicationDeadline} optional />
    </>
  );

  if (mode === "edit") {
    return (
      <form action={updateAction} className="flex flex-col gap-4">
        {updateState?.message && (
          <p role="status" className={updateState.ok ? "text-sm font-medium text-[var(--color-success)]" : "text-sm font-medium text-[var(--color-error)]"}>
            {updateState.message}
          </p>
        )}
        {fields}
        <Button type="submit" loading={isUpdatePending} className="self-start">
          Save changes
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {state?.message && !state.ok && (
        <p role="alert" className="text-sm font-medium text-[var(--color-error)]">
          {state.message}
        </p>
      )}
      <form id="job-create-form" className="flex flex-col gap-4">
        {fields}
      </form>
      <div className="flex gap-3">
        <Button type="submit" form="job-create-form" formAction={draftAction} variant="secondary" loading={isDraftPending}>
          Save as draft
        </Button>
        <Button type="submit" form="job-create-form" formAction={publishAction} loading={isPublishPending}>
          Publish job
        </Button>
      </div>
    </div>
  );
}

async function fallbackAction(): Promise<JobFormState> {
  return { ok: false, message: "This action is not available." };
}

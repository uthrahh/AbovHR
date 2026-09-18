"use client";

import { useActionState } from "react";
import { updateBasicInfoAction } from "@/lib/actions/profile";
import { TextField, TextAreaField, SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const WORK_MODES = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "OFFICE", label: "On-site" },
  { value: "FIELD", label: "Field" },
];

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "APPRENTICESHIP", label: "Apprenticeship" },
  { value: "CONTRACT", label: "Contract" },
];

type Defaults = {
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  locationCity: string;
  locationState: string;
  experienceYears: string;
  availability: string;
  salaryExpectationMin: string;
  salaryExpectationMax: string;
  preferredRoles: string;
  preferredWorkModes: string[];
  preferredEmploymentTypes: string[];
};

export function BasicInfoForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, isPending] = useActionState(updateBasicInfoAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.message && (
        <p
          role="status"
          className={
            state.ok
              ? "text-sm font-medium text-[var(--color-success)]"
              : "text-sm font-medium text-[var(--color-error)]"
          }
        >
          {state.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="First name" name="firstName" defaultValue={defaults.firstName} />
        <TextField label="Last name" name="lastName" defaultValue={defaults.lastName} optional />
      </div>

      <TextField label="Headline" name="headline" defaultValue={defaults.headline} placeholder="e.g. Aspiring Data Analyst" />
      <TextAreaField label="Professional summary" name="summary" defaultValue={defaults.summary} rows={4} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField label="GitHub" name="githubUrl" type="url" defaultValue={defaults.githubUrl} placeholder="https://github.com/…" optional />
        <TextField label="LinkedIn" name="linkedinUrl" type="url" defaultValue={defaults.linkedinUrl} placeholder="https://linkedin.com/in/…" optional />
        <TextField label="Portfolio" name="portfolioUrl" type="url" defaultValue={defaults.portfolioUrl} placeholder="https://…" optional />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="City" name="locationCity" defaultValue={defaults.locationCity} />
        <TextField label="State" name="locationState" defaultValue={defaults.locationState} optional />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Years of experience" name="experienceYears" type="number" min={0} max={50} step={0.5} defaultValue={defaults.experienceYears} />
        <SelectField label="Availability" name="availability" defaultValue={defaults.availability}>
          <option value="IMMEDIATELY">Immediately</option>
          <option value="WITHIN_2_WEEKS">Within 2 weeks</option>
          <option value="WITHIN_A_MONTH">Within a month</option>
          <option value="NOT_LOOKING">Not currently looking</option>
        </SelectField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Salary expectation — min (₹/yr)" name="salaryExpectationMin" type="number" min={0} defaultValue={defaults.salaryExpectationMin} optional />
        <TextField label="Salary expectation — max (₹/yr)" name="salaryExpectationMax" type="number" min={0} defaultValue={defaults.salaryExpectationMax} optional />
      </div>

      <TextField
        label="Preferred roles"
        name="preferredRoles"
        defaultValue={defaults.preferredRoles}
        placeholder="Comma-separated, e.g. Data Analyst, BI Analyst"
        optional
      />

      <fieldset>
        <legend className="text-sm font-medium text-[var(--color-text-primary)]">Preferred work mode</legend>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {WORK_MODES.map((mode) => (
            <label key={mode.value} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                name="preferredWorkModes"
                value={mode.value}
                defaultChecked={defaults.preferredWorkModes.includes(mode.value)}
                className="h-4 w-4 accent-[var(--color-accent-text)]"
              />
              {mode.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-[var(--color-text-primary)]">Preferred employment type</legend>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {EMPLOYMENT_TYPES.map((type) => (
            <label key={type.value} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                name="preferredEmploymentTypes"
                value={type.value}
                defaultChecked={defaults.preferredEmploymentTypes.includes(type.value)}
                className="h-4 w-4 accent-[var(--color-accent-text)]"
              />
              {type.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" loading={isPending} className="self-start">
        Save changes
      </Button>
    </form>
  );
}

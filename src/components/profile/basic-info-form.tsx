"use client";

import { useActionState, useState, useTransition } from "react";
import { updateBasicInfoAction, generateSummaryAction } from "@/lib/actions/profile";
import { TextField, TextAreaField, SelectField } from "@/components/ui/field";
import { MultiCombobox, type ComboboxOption } from "@/components/ui/multi-combobox";
import { Button } from "@/components/ui/button";
import { useProfileImport } from "@/components/profile/profile-import-context";

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
  githubUsername: string;
  linkedinUsername: string;
  portfolioUrl: string;
  locationCity: string;
  locationState: string;
  experienceYears: string;
  availability: string;
  salaryExpectationMin: string;
  salaryExpectationMax: string;
  preferredRoles: string[];
  preferredWorkModes: string[];
  preferredEmploymentTypes: string[];
};

export function BasicInfoForm({ defaults, roleCatalog }: { defaults: Defaults; roleCatalog: ComboboxOption[] }) {
  const [state, formAction, isPending] = useActionState(updateBasicInfoAction, undefined);
  const { basicInfo: importedBasicInfo } = useProfileImport();

  const [firstName, setFirstName] = useState(defaults.firstName);
  const [lastName, setLastName] = useState(defaults.lastName);
  const [headline, setHeadline] = useState(defaults.headline);
  const [summary, setSummary] = useState(defaults.summary);
  const [githubUsername, setGithubUsername] = useState(defaults.githubUsername);
  const [linkedinUsername, setLinkedinUsername] = useState(defaults.linkedinUsername);
  const [portfolioUrl, setPortfolioUrl] = useState(defaults.portfolioUrl);

  const [isGenerating, startGenerating] = useTransition();
  const [generateNote, setGenerateNote] = useState<string | null>(null);

  const errors = state?.fieldErrors ?? {};

  // Only fill fields the candidate hasn't already filled in — an import never
  // overwrites something they typed or already had saved. Applied during
  // render (not an effect) so it happens in the same commit as the import.
  const [appliedImport, setAppliedImport] = useState<typeof importedBasicInfo>(null);
  if (importedBasicInfo && importedBasicInfo !== appliedImport) {
    setAppliedImport(importedBasicInfo);
    if (importedBasicInfo.firstName) setFirstName((v) => v || importedBasicInfo.firstName!);
    if (importedBasicInfo.lastName) setLastName((v) => v || importedBasicInfo.lastName!);
    if (importedBasicInfo.headline) setHeadline((v) => v || importedBasicInfo.headline!);
    if (importedBasicInfo.summary) setSummary((v) => v || importedBasicInfo.summary!);
    if (importedBasicInfo.githubUsername) setGithubUsername((v) => v || importedBasicInfo.githubUsername!);
    if (importedBasicInfo.linkedinUsername) setLinkedinUsername((v) => v || importedBasicInfo.linkedinUsername!);
    if (importedBasicInfo.portfolioUrl) setPortfolioUrl((v) => v || importedBasicInfo.portfolioUrl!);
  }

  function handleGenerateSummary() {
    setGenerateNote(null);
    startGenerating(async () => {
      const result = await generateSummaryAction();
      if (result.ok) {
        setSummary(result.summary);
        setGenerateNote("Generated from your profile details — review and edit before saving.");
      } else {
        setGenerateNote(result.message);
      }
    });
  }

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
        <TextField label="First name" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} />
        <TextField label="Last name" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} optional error={errors.lastName} />
      </div>

      <TextField
        label="Headline"
        name="headline"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="e.g. Aspiring Data Analyst"
        error={errors.headline}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="summary-field" className="text-sm font-medium text-[var(--color-text-primary)]">
            Professional summary
          </label>
          <Button type="button" variant="ghost" size="sm" loading={isGenerating} onClick={handleGenerateSummary}>
            Generate from my profile
          </Button>
        </div>
        <TextAreaField
          label=""
          wrapperClassName="[&>label]:hidden"
          name="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          error={errors.summary}
          hint={generateNote ?? "Generate a first draft from your headline, education, skills, and experience, then edit it to sound like you."}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <UsernameField
          label="GitHub"
          name="githubUsername"
          prefix="github.com/"
          value={githubUsername}
          onChange={setGithubUsername}
          error={errors.githubUsername}
        />
        <UsernameField
          label="LinkedIn"
          name="linkedinUsername"
          prefix="linkedin.com/in/"
          value={linkedinUsername}
          onChange={setLinkedinUsername}
          error={errors.linkedinUsername}
        />
        <TextField
          label="Portfolio"
          name="portfolioUrl"
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://…"
          optional
          error={errors.portfolioUrl}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="City" name="locationCity" defaultValue={defaults.locationCity} error={errors.locationCity} />
        <TextField label="State" name="locationState" defaultValue={defaults.locationState} optional error={errors.locationState} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Years of experience"
          name="experienceYears"
          type="number"
          min={0}
          max={50}
          step={0.5}
          defaultValue={defaults.experienceYears}
          error={errors.experienceYears}
        />
        <SelectField label="Availability" name="availability" defaultValue={defaults.availability} error={errors.availability}>
          <option value="IMMEDIATELY">Immediately</option>
          <option value="WITHIN_2_WEEKS">Within 2 weeks</option>
          <option value="WITHIN_A_MONTH">Within a month</option>
          <option value="NOT_LOOKING">Not currently looking</option>
        </SelectField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Salary expectation — min (₹/yr)"
          name="salaryExpectationMin"
          type="number"
          min={0}
          defaultValue={defaults.salaryExpectationMin}
          optional
          error={errors.salaryExpectationMin}
        />
        <TextField
          label="Salary expectation — max (₹/yr)"
          name="salaryExpectationMax"
          type="number"
          min={0}
          defaultValue={defaults.salaryExpectationMax}
          optional
          error={errors.salaryExpectationMax}
        />
      </div>

      <MultiCombobox
        name="preferredRoles"
        label="Preferred roles"
        options={roleCatalog}
        defaultValues={defaults.preferredRoles}
        allowCustom
        placeholder="Type to search or add a role…"
        hint="Pick every role you'd consider — we use this to match and score jobs for you."
        error={errors.preferredRoles}
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

function UsernameField({
  label,
  name,
  prefix,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  prefix: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        <span className="ml-1.5 font-normal text-[var(--color-text-muted)]">(optional)</span>
      </label>
      <div
        className={
          "flex items-center overflow-hidden rounded-[var(--radius-sm)] border bg-[var(--color-surface)] focus-within:outline-2 focus-within:outline-[var(--color-focus)] " +
          (error ? "border-[var(--color-error)]" : "border-[var(--color-border-strong)]")
        }
      >
        <span className="whitespace-nowrap bg-[var(--color-surface-sunken)] px-2.5 py-2.5 text-sm text-[var(--color-text-muted)]">{prefix}</span>
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="username"
          aria-invalid={!!error}
          className="w-full min-w-0 bg-transparent px-2.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
        />
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-[var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  );
}

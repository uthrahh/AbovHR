type CompletenessInput = {
  headline: string | null;
  summary: string | null;
  locationCity: string | null;
  experienceYears: unknown;
  preferredRoles: string[];
  educationCount: number;
  experienceCount: number;
  skillCount: number;
  resumeCount: number;
};

const CHECKS: { id: string; label: string; weight: number; test: (p: CompletenessInput) => boolean }[] = [
  { id: "headline", label: "Add a professional headline", weight: 10, test: (p) => !!p.headline },
  { id: "summary", label: "Write a short professional summary", weight: 10, test: (p) => !!p.summary },
  { id: "location", label: "Add your location", weight: 10, test: (p) => !!p.locationCity },
  { id: "experienceYears", label: "Add your years of experience", weight: 10, test: (p) => p.experienceYears !== null },
  { id: "preferredRoles", label: "Add at least one preferred role", weight: 10, test: (p) => p.preferredRoles.length > 0 },
  { id: "education", label: "Add your education", weight: 15, test: (p) => p.educationCount > 0 },
  { id: "experience", label: "Add your work experience", weight: 10, test: (p) => p.experienceCount > 0 },
  { id: "skills", label: "Add at least 3 skills", weight: 15, test: (p) => p.skillCount >= 3 },
  { id: "resume", label: "Upload your resume", weight: 10, test: (p) => p.resumeCount > 0 },
];

export function computeProfileCompleteness(input: CompletenessInput) {
  const items = CHECKS.map((check) => ({ id: check.id, label: check.label, weight: check.weight, done: check.test(input) }));
  const percentage = Math.round(items.reduce((sum, i) => sum + (i.done ? i.weight : 0), 0));
  const nextAction = items.find((i) => !i.done);
  return { percentage, items, nextAction };
}

/**
 * Transparent job-compatibility scoring.
 *
 * This is a deterministic, rules-based score — not a machine-learning
 * prediction — so every point in the total can be traced back to a
 * specific, explainable factor. See docs/architecture/matching.md.
 */

export type MatchFactorId = "skills" | "experience" | "location" | "education" | "workMode";

export type MatchFactor = {
  id: MatchFactorId;
  label: string;
  weight: number;
  score: number; // 0-1
  detail: string;
};

export type MatchResult = {
  percentage: number;
  factors: MatchFactor[];
};

export type CandidateForMatching = {
  skillNames: string[];
  experienceYears: number | null;
  locationCity: string | null;
  preferredWorkModes: string[];
  hasEducationRecord: boolean;
};

export type JobForMatching = {
  requiredSkillNames: string[];
  experienceMinYears: number | null;
  experienceMaxYears: number | null;
  locationCity: string | null;
  workMode: string;
  educationRequirement: string | null;
};

const WEIGHTS: Record<MatchFactorId, number> = {
  skills: 0.4,
  experience: 0.2,
  workMode: 0.2,
  location: 0.1,
  education: 0.1,
};

export function computeJobMatch(candidate: CandidateForMatching, job: JobForMatching): MatchResult {
  const factors: MatchFactor[] = [];

  // Skills
  const candidateSkillSet = new Set(candidate.skillNames.map((s) => s.toLowerCase()));
  const required = job.requiredSkillNames;
  const matchedSkills = required.filter((s) => candidateSkillSet.has(s.toLowerCase()));
  const skillsScore = required.length === 0 ? 1 : matchedSkills.length / required.length;
  factors.push({
    id: "skills",
    label: "Skills match",
    weight: WEIGHTS.skills,
    score: skillsScore,
    detail:
      required.length === 0
        ? "This job doesn't list specific required skills."
        : `You have ${matchedSkills.length} of ${required.length} listed skills (${matchedSkills.join(", ") || "none yet"}).`,
  });

  // Experience
  let experienceScore = 0.5;
  let experienceDetail = "Experience level not specified on your profile.";
  if (candidate.experienceYears !== null) {
    const min = job.experienceMinYears ?? 0;
    const max = job.experienceMaxYears ?? Infinity;
    if (candidate.experienceYears >= min && candidate.experienceYears <= max) {
      experienceScore = 1;
      experienceDetail = `Your ${candidate.experienceYears} years fits the ${min}–${Number.isFinite(max) ? max : "+"} year range.`;
    } else if (candidate.experienceYears < min) {
      const gap = min - candidate.experienceYears;
      experienceScore = Math.max(0, 1 - gap / Math.max(min, 1));
      experienceDetail = `This role asks for ${min}+ years; you have ${candidate.experienceYears}.`;
    } else {
      experienceScore = 0.75;
      experienceDetail = `You have more experience (${candidate.experienceYears} yrs) than the role's typical range.`;
    }
  }
  factors.push({ id: "experience", label: "Experience match", weight: WEIGHTS.experience, score: experienceScore, detail: experienceDetail });

  // Work mode
  const workModeScore = candidate.preferredWorkModes.length === 0
    ? 0.5
    : candidate.preferredWorkModes.includes(job.workMode)
      ? 1
      : 0.2;
  factors.push({
    id: "workMode",
    label: "Work preference match",
    weight: WEIGHTS.workMode,
    score: workModeScore,
    detail:
      candidate.preferredWorkModes.length === 0
        ? "Set your preferred work mode on your profile to improve this."
        : candidate.preferredWorkModes.includes(job.workMode)
          ? `This role is ${job.workMode.toLowerCase()}, matching your preference.`
          : `This role is ${job.workMode.toLowerCase()}; your profile prefers ${candidate.preferredWorkModes.join(", ").toLowerCase()}.`,
  });

  // Location
  let locationScore = 0.5;
  let locationDetail = "Add your location to improve this.";
  if (job.workMode === "REMOTE") {
    locationScore = 1;
    locationDetail = "This role is remote, so location isn't a constraint.";
  } else if (candidate.locationCity && job.locationCity) {
    locationScore = candidate.locationCity.toLowerCase() === job.locationCity.toLowerCase() ? 1 : 0.3;
    locationDetail =
      locationScore === 1
        ? `Based in ${job.locationCity}, matching your location.`
        : `This role is based in ${job.locationCity}; your profile lists ${candidate.locationCity}.`;
  }
  factors.push({ id: "location", label: "Location match", weight: WEIGHTS.location, score: locationScore, detail: locationDetail });

  // Education
  let educationScore = 0.6;
  let educationDetail = "Add your education to improve this.";
  const req = (job.educationRequirement ?? "").toLowerCase();
  if (!job.educationRequirement || req.includes("not required")) {
    educationScore = 1;
    educationDetail = "This role doesn't require a specific degree.";
  } else if (candidate.hasEducationRecord) {
    educationScore = 1;
    educationDetail = "Your profile lists education matching the typical requirement.";
  } else {
    educationScore = 0.4;
    educationDetail = `This role typically expects: ${job.educationRequirement}.`;
  }
  factors.push({ id: "education", label: "Education match", weight: WEIGHTS.education, score: educationScore, detail: educationDetail });

  const percentage = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0) * 100);

  return { percentage, factors };
}

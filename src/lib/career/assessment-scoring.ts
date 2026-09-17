const INTEREST_TO_CATEGORY: Record<string, string> = {
  data: "Data",
  design: "Design",
  engineering: "Engineering",
  marketing: "Marketing",
  people: "HR",
};

const WORK_STYLE_LABEL: Record<string, string> = {
  independent: "independent, focused work",
  collaborative: "collaborative, team-based work",
  mixed: "a mix of independent and collaborative work",
};

export type AssessmentResponses = {
  interest?: string;
  workStyle?: string;
  technicalComfort?: string;
};

export type CareerPathForScoring = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string | null;
};

export type CareerSuggestion = {
  path: CareerPathForScoring;
  rank: number;
  reason: string;
};

export function scoreCareerPaths(responses: AssessmentResponses, careerPaths: CareerPathForScoring[]): CareerSuggestion[] {
  const targetCategory = responses.interest ? INTEREST_TO_CATEGORY[responses.interest] : undefined;
  const workStyleText = responses.workStyle ? WORK_STYLE_LABEL[responses.workStyle] : undefined;

  const primary = targetCategory ? careerPaths.filter((p) => p.category === targetCategory) : [];
  const rest = careerPaths.filter((p) => !primary.includes(p));

  const suggestions: CareerSuggestion[] = [];
  let rank = 1;

  for (const path of primary) {
    const reasons: string[] = [];
    reasons.push(`You told us you're drawn to work like this in your assessment.`);
    if (workStyleText) reasons.push(`You indicated a preference for ${workStyleText}, which is common in this kind of role.`);
    suggestions.push({ path, rank: rank++, reason: reasons.join(" ") });
  }

  for (const path of rest.slice(0, Math.max(0, 3 - suggestions.length))) {
    suggestions.push({
      path,
      rank: rank++,
      reason: "Shown as an additional option based on the career paths available on Abov today.",
    });
  }

  return suggestions.slice(0, 5);
}

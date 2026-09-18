import type { ProfileSectionKey } from "@/lib/profile/sections";

/**
 * Deterministic, keyword-based ATS score — the same "does this text contain
 * the words the job asks for" approach real applicant-tracking systems use,
 * not a machine-learning judgment. Every point is traceable back to a
 * specific matched/missing keyword or skill, and only sections the employer
 * actually requested (and the candidate is sharing) are read — this is what
 * keeps "only relevant/requested details are shared, and checked for ATS"
 * true in practice, not just in a privacy notice.
 */

const STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "will", "this",
  "that", "have", "has", "from", "into", "who", "their", "them", "they",
  "not", "but", "can", "able", "using", "use", "used", "work", "working",
  "role", "team", "years", "year", "experience", "experienced", "strong",
  "good", "excellent", "etc", "including", "include", "includes", "such",
  "job", "candidate", "candidates", "we", "you'll", "you're", "ability",
  "skills", "skill", "knowledge", "understanding", "responsibilities",
  "requirements", "required", "preferred", "plus", "must", "should",
  "would", "may", "also", "any", "all", "other", "across", "within",
  "about", "each", "per", "new", "one", "two", "well", "more", "most",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function extractKeywords(text: string, limit: number): string[] {
  const counts = new Map<string, number>();
  for (const word of tokenize(text)) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export type AtsProfileText = Partial<Record<ProfileSectionKey, string>>;

export type AtsJobInput = {
  title: string;
  description: string;
  responsibilities?: string | null;
  requirements?: string | null;
  requiredSkillNames: string[];
};

export type AtsBreakdown = {
  score: number;
  skillsScore: number;
  keywordScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionsUsed: ProfileSectionKey[];
  sectionsRequestedButNotShared: ProfileSectionKey[];
};

const SKILLS_WEIGHT = 0.5;
const KEYWORDS_WEIGHT = 0.5;
const KEYWORD_LIMIT = 20;

/**
 * `sectionText` should only contain text for sections the candidate is
 * actually sharing for this job — the caller is responsible for that
 * filtering (see src/lib/data/candidate.ts buildAtsProfileText).
 */
export function computeAtsScore(
  job: AtsJobInput,
  candidateSkillNames: string[],
  sectionText: AtsProfileText,
  requestedSections: ProfileSectionKey[]
): AtsBreakdown {
  const sharedSections = Object.keys(sectionText) as ProfileSectionKey[];
  const sectionsRequestedButNotShared = requestedSections.filter((s) => !sharedSections.includes(s));

  // Skills
  const candidateSkillSet = new Set(candidateSkillNames.map((s) => s.toLowerCase()));
  const requiredSkills = job.requiredSkillNames;
  const matchedSkills = requiredSkills.filter((s) => candidateSkillSet.has(s.toLowerCase()));
  const missingSkills = requiredSkills.filter((s) => !candidateSkillSet.has(s.toLowerCase()));
  const skillsScore = requiredSkills.length === 0 ? 1 : matchedSkills.length / requiredSkills.length;

  // Keywords, drawn from the JD's own text.
  const jdText = [job.title, job.description, job.responsibilities ?? "", job.requirements ?? ""].join(" ");
  const jdKeywords = extractKeywords(jdText, KEYWORD_LIMIT);

  const candidateBlob = Object.values(sectionText).join(" ").toLowerCase();
  const matchedKeywords = jdKeywords.filter((kw) => candidateBlob.includes(kw));
  const missingKeywords = jdKeywords.filter((kw) => !candidateBlob.includes(kw));
  const keywordScore = jdKeywords.length === 0 ? 1 : matchedKeywords.length / jdKeywords.length;

  const score = Math.round((skillsScore * SKILLS_WEIGHT + keywordScore * KEYWORDS_WEIGHT) * 100);

  return {
    score,
    skillsScore: Math.round(skillsScore * 100),
    keywordScore: Math.round(keywordScore * 100),
    matchedSkills,
    missingSkills,
    matchedKeywords,
    missingKeywords,
    sectionsUsed: sharedSections,
    sectionsRequestedButNotShared,
  };
}

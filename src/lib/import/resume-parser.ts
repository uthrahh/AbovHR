// Heuristic, deterministic extraction from a resume PDF's raw text — no LLM
// call is made. We only surface fields we can detect with high confidence
// (links, a plausible headline, and catalog-matched skills); education and
// work history are left for the candidate to enter, since guessing structured
// dates/titles from free text is unreliable and would risk silently wrong data.

export type ResumeImportDraft = {
  headline?: string;
  githubUsername?: string;
  linkedinUsername?: string;
  portfolioUrl?: string;
  matchedSkills: string[];
};

const URL_PATTERN = /https?:\/\/[^\s,)]+/gi;

export async function extractResumeText(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return result.text ?? "";
}

export function parseResumeText(text: string, skillCatalog: string[]): ResumeImportDraft {
  const draft: ResumeImportDraft = { matchedSkills: [] };

  const urls = text.match(URL_PATTERN) ?? [];
  for (const raw of urls) {
    const url = raw.replace(/[.,;]+$/, "");
    if (/github\.com/i.test(url) && !draft.githubUsername) {
      const match = url.match(/github\.com\/([a-zA-Z0-9-]+)/i);
      if (match) draft.githubUsername = match[1];
    } else if (/linkedin\.com/i.test(url) && !draft.linkedinUsername) {
      const match = url.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
      if (match) draft.linkedinUsername = match[1];
    } else if (!draft.portfolioUrl) {
      draft.portfolioUrl = url;
    }
  }

  const firstLine = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length >= 4 && l.length <= 80 && !/[.:;]$/.test(l) && !URL_PATTERN.test(l));
  URL_PATTERN.lastIndex = 0;
  if (firstLine) draft.headline = firstLine;

  const lowerText = text.toLowerCase();
  const matched = new Set<string>();
  for (const skill of skillCatalog) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped.toLowerCase()}(?:$|[^a-z0-9])`, "i");
    if (pattern.test(lowerText)) matched.add(skill);
  }
  draft.matchedSkills = Array.from(matched).slice(0, 25);

  return draft;
}

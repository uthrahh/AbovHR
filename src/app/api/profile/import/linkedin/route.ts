import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/rbac";
import { rateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import {
  parseLinkedInProfileCsv,
  parseLinkedInEducationCsv,
  parseLinkedInPositionsCsv,
  parseLinkedInSkillsCsv,
  type LinkedInImportDraft,
} from "@/lib/import/linkedin-parser";

const MAX_CSV_BYTES = 2 * 1024 * 1024;

async function readCsvField(formData: FormData, name: string): Promise<string | null> {
  const file = formData.get(name);
  if (!(file instanceof File)) return null;
  if (file.size === 0) return null;
  if (file.size > MAX_CSV_BYTES) throw new Error(`${name} is too large.`);
  return Buffer.from(await file.arrayBuffer()).toString("utf-8");
}

export async function POST(request: Request) {
  const { ok } = rateLimit(clientKeyFromRequest(request, "linkedin-import"), 10, 60_000);
  if (!ok) return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  if (user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Only candidate accounts can import from LinkedIn." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid upload." }, { status: 400 });

  let profileCsv: string | null, educationCsv: string | null, positionsCsv: string | null, skillsCsv: string | null;
  try {
    [profileCsv, educationCsv, positionsCsv, skillsCsv] = await Promise.all([
      readCsvField(formData, "profileCsv"),
      readCsvField(formData, "educationCsv"),
      readCsvField(formData, "positionsCsv"),
      readCsvField(formData, "skillsCsv"),
    ]);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid file." }, { status: 400 });
  }

  if (!profileCsv && !educationCsv && !positionsCsv && !skillsCsv) {
    return NextResponse.json({ error: "Attach at least one exported CSV (Profile, Education, Positions, or Skills)." }, { status: 400 });
  }

  const draft: LinkedInImportDraft = { skills: [], education: [], experience: [] };
  try {
    if (profileCsv) Object.assign(draft, parseLinkedInProfileCsv(profileCsv));
    if (educationCsv) draft.education = parseLinkedInEducationCsv(educationCsv);
    if (positionsCsv) draft.experience = parseLinkedInPositionsCsv(positionsCsv);
    if (skillsCsv) draft.skills = parseLinkedInSkillsCsv(skillsCsv);
  } catch {
    return NextResponse.json({ error: "Couldn't parse those files — make sure they're the unmodified CSVs from your LinkedIn data export." }, { status: 400 });
  }

  return NextResponse.json({ draft });
}

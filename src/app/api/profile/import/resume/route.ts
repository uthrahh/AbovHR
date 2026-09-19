import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { rateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import { MAX_UPLOAD_BYTES } from "@/lib/storage";
import { extractResumeText, parseResumeText } from "@/lib/import/resume-parser";

export async function POST(request: Request) {
  const { ok } = rateLimit(clientKeyFromRequest(request, "resume-import"), 10, 60_000);
  if (!ok) return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  if (user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Only candidate accounts can import a resume." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid upload." }, { status: 400 });

  const file = formData.get("resume");
  const pastedText = formData.get("resumeText");

  let text: string;
  if (file instanceof File) {
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Upload a PDF, or paste your resume text instead." }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: `File is too large. Max size is ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB.` }, { status: 400 });
    }
    if (file.size === 0) return NextResponse.json({ error: "The file appears to be empty." }, { status: 400 });

    try {
      text = await extractResumeText(Buffer.from(await file.arrayBuffer()));
    } catch {
      return NextResponse.json({ error: "Couldn't read that PDF. Try pasting your resume text instead." }, { status: 400 });
    }
  } else if (typeof pastedText === "string" && pastedText.trim()) {
    text = pastedText.slice(0, 20_000);
  } else {
    return NextResponse.json({ error: "Attach a PDF or paste your resume text." }, { status: 400 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "Couldn't find any text in that file. Try pasting your resume text instead." }, { status: 400 });
  }

  const skillCatalog = await prisma.skill.findMany({ select: { name: true } });
  const draft = parseResumeText(text, skillCatalog.map((s) => s.name));

  return NextResponse.json({ draft });
}

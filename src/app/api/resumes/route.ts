import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { rateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import { saveUploadedFile, ALLOWED_RESUME_TYPES, MAX_UPLOAD_BYTES } from "@/lib/storage";

export async function POST(request: Request) {
  const { ok } = rateLimit(clientKeyFromRequest(request, "resume-upload"), 10, 60_000);
  if (!ok) return NextResponse.json({ error: "Too many uploads. Please wait a minute." }, { status: 429 });

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in to upload a resume." }, { status: 401 });
  }
  if (user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Only candidate accounts can upload resumes." }, { status: 403 });
  }

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Complete your profile first." }, { status: 400 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("resume");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_RESUME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Resumes must be a PDF or Word document (.pdf, .doc, .docx)." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: `File is too large. Max size is ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB.` }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "The file appears to be empty." }, { status: 400 });
  }

  const existingCount = await prisma.resume.count({ where: { candidateProfileId: profile.id } });
  if (existingCount >= 5) {
    return NextResponse.json({ error: "You can store up to 5 resumes. Delete one before adding another." }, { status: 400 });
  }

  const { storageKey, sizeBytes } = await saveUploadedFile(`resumes/${profile.id}`, file);

  const resume = await prisma.resume.create({
    data: {
      candidateProfileId: profile.id,
      fileName: file.name.slice(0, 200),
      fileUrl: storageKey,
      fileSizeBytes: sizeBytes,
      mimeType: file.type,
      isPrimary: existingCount === 0,
    },
  });

  return NextResponse.json({ id: resume.id, fileName: resume.fileName, isPrimary: resume.isPrimary });
}

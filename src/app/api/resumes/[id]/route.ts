import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { readStoredFile, deleteStoredFile } from "@/lib/storage";

async function canAccessResume(userId: string, role: string, resume: { candidateProfileId: string; candidateProfile: { userId: string } }) {
  if (role === "ADMIN") return true;
  if (resume.candidateProfile.userId === userId) return true;
  if (role === "EMPLOYER" || role === "RECRUITER") {
    const hasApplicationAccess = await prisma.application.findFirst({
      where: {
        candidateProfileId: resume.candidateProfileId,
        job: { company: { members: { some: { userId } } } },
      },
    });
    return !!hasApplicationAccess;
  }
  return false;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const resume = await prisma.resume.findUnique({
    where: { id },
    include: { candidateProfile: { select: { userId: true } } },
  });
  if (!resume) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const allowed = await canAccessResume(user.id, user.role, resume);
  if (!allowed) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const bytes = await readStoredFile(resume.fileUrl).catch(() => null);
  if (!bytes) return NextResponse.json({ error: "File not found in storage." }, { status: 404 });

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": resume.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(resume.fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const resume = await prisma.resume.findUnique({
    where: { id },
    include: { candidateProfile: { select: { userId: true } } },
  });
  if (!resume) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (resume.candidateProfile.userId !== user.id) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  await deleteStoredFile(resume.fileUrl);
  await prisma.resume.delete({ where: { id } });

  if (resume.isPrimary) {
    const nextPrimary = await prisma.resume.findFirst({ where: { candidateProfileId: resume.candidateProfileId } });
    if (nextPrimary) {
      await prisma.resume.update({ where: { id: nextPrimary.id }, data: { isPrimary: true } });
    }
  }

  return NextResponse.json({ ok: true });
}

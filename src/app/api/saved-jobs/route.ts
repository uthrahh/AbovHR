import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { rateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

const bodySchema = z.object({ jobId: z.string().min(1) });

export async function POST(request: Request) {
  const { ok } = rateLimit(clientKeyFromRequest(request, "saved-jobs"), 60, 60_000);
  if (!ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in to save jobs." }, { status: 401 });
  }
  if (user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Only candidate accounts can save jobs." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Complete your candidate profile first." }, { status: 400 });

  const existing = await prisma.savedJob.findUnique({
    where: { candidateProfileId_jobId: { candidateProfileId: profile.id, jobId: parsed.data.jobId } },
  });

  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.savedJob.create({ data: { candidateProfileId: profile.id, jobId: parsed.data.jobId } });
  return NextResponse.json({ saved: true });
}

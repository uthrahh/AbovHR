"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { requireEmployerMembershipStrict } from "@/lib/auth/employer";

const VALID_STATUSES = ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW", "ASSESSMENT", "OFFER", "HIRED", "REJECTED"] as const;
type ApplicationStatusValue = (typeof VALID_STATUSES)[number];

async function loadApplicationForEmployer(applicationId: string, companyId: string) {
  return prisma.application.findFirst({
    where: { id: applicationId, job: { companyId } },
    include: { candidateProfile: { include: { user: true } }, job: true },
  });
}

export async function updateApplicationStatusAction(applicationId: string, formData: FormData) {
  const user = await requireUser();
  const membership = await requireEmployerMembershipStrict(user.id);
  const nextStatus = formData.get("status");
  if (typeof nextStatus !== "string" || !VALID_STATUSES.includes(nextStatus as ApplicationStatusValue)) return;

  const application = await loadApplicationForEmployer(applicationId, membership.companyId);
  if (!application) return;

  await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId },
      data: { status: nextStatus as ApplicationStatusValue },
    }),
    prisma.applicationStatusHistory.create({
      data: {
        applicationId,
        fromStatus: application.status,
        toStatus: nextStatus as ApplicationStatusValue,
        changedByUserId: user.id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: application.candidateProfile.userId,
        type: "APPLICATION_UPDATE",
        title: "Application status updated",
        body: `Your application for ${application.job.title} is now: ${nextStatus.replace("_", " ").toLowerCase()}.`,
        linkUrl: "/dashboard/applications",
      },
    }),
  ]);

  revalidatePath(`/employer/jobs/${application.jobId}/applicants`);
}

export async function addApplicationNoteAction(applicationId: string, formData: FormData) {
  const user = await requireUser();
  const membership = await requireEmployerMembershipStrict(user.id);
  const note = formData.get("note");
  if (typeof note !== "string" || !note.trim()) return;

  const application = await loadApplicationForEmployer(applicationId, membership.companyId);
  if (!application) return;

  await prisma.applicationNote.create({
    data: { applicationId, authorUserId: user.id, note: note.trim().slice(0, 2000) },
  });

  revalidatePath(`/employer/jobs/${application.jobId}/applicants`);
}

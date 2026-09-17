"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";

export async function enrollLearningPathAction(learningPathId: string, pathSlug: string) {
  const user = await requireUser();

  const existing = await prisma.userLearningPath.findUnique({
    where: { userId_learningPathId: { userId: user.id, learningPathId } },
  });
  if (!existing) {
    await prisma.userLearningPath.create({
      data: { userId: user.id, learningPathId, status: "IN_PROGRESS" },
    });
  }

  revalidatePath(`/learn/${pathSlug}`);
  revalidatePath("/learn");
}

export async function toggleModuleCompleteAction(userLearningPathId: string, learningModuleId: string, pathSlug: string) {
  const user = await requireUser();

  const userPath = await prisma.userLearningPath.findFirst({ where: { id: userLearningPathId, userId: user.id } });
  if (!userPath) return;

  const existing = await prisma.moduleProgress.findUnique({
    where: { userLearningPathId_learningModuleId: { userLearningPathId, learningModuleId } },
  });

  const nextStatus = existing?.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";

  await prisma.moduleProgress.upsert({
    where: { userLearningPathId_learningModuleId: { userLearningPathId, learningModuleId } },
    update: { status: nextStatus, completedAt: nextStatus === "COMPLETED" ? new Date() : null },
    create: { userLearningPathId, learningModuleId, status: nextStatus, completedAt: nextStatus === "COMPLETED" ? new Date() : null },
  });

  const allProgress = await prisma.moduleProgress.findMany({ where: { userLearningPathId } });
  const totalModules = await prisma.learningModule.count({ where: { learningPathId: userPath.learningPathId } });
  const completedCount = allProgress.filter((p) => p.status === "COMPLETED").length;

  await prisma.userLearningPath.update({
    where: { id: userLearningPathId },
    data: {
      status: completedCount >= totalModules && totalModules > 0 ? "COMPLETED" : "IN_PROGRESS",
      completedAt: completedCount >= totalModules && totalModules > 0 ? new Date() : null,
    },
  });

  revalidatePath(`/learn/${pathSlug}`);
  revalidatePath("/learn");
  revalidatePath("/dashboard");
}

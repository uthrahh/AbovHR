"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { scoreCareerPaths, type AssessmentResponses } from "@/lib/career/assessment-scoring";

export async function submitCareerAssessmentAction(assessmentId: string, formData: FormData) {
  const user = await requireUser();

  const responses: AssessmentResponses = {
    interest: formData.get("interest")?.toString(),
    workStyle: formData.get("workStyle")?.toString(),
    technicalComfort: formData.get("technicalComfort")?.toString(),
  };

  const careerPaths = await prisma.careerPath.findMany();
  const suggestions = scoreCareerPaths(responses, careerPaths);

  await prisma.assessmentResult.create({
    data: {
      assessmentId,
      userId: user.id,
      rawResponses: responses,
      summary: {
        suggestions: suggestions.map((s) => ({ pathId: s.path.id, slug: s.path.slug, title: s.path.title, rank: s.rank, reason: s.reason })),
      },
    },
  });

  redirect("/career/results");
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { requireEmployerMembershipStrict } from "@/lib/auth/employer";
import type { ActionState } from "@/lib/actions/profile";

const companySchema = z.object({
  name: z.string().trim().min(2).max(160),
  about: z.string().trim().max(2000).optional(),
  industry: z.string().trim().max(100).optional(),
  websiteUrl: z.string().trim().url().optional().or(z.literal("")),
  sizeRange: z.string().trim().max(40).optional(),
  headquartersCity: z.string().trim().max(80).optional(),
});

export async function updateCompanyAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const membership = await requireEmployerMembershipStrict(user.id);

  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    return { ok: false, message: "Only company owners or admins can edit the company profile." };
  }

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    about: formData.get("about") || undefined,
    industry: formData.get("industry") || undefined,
    websiteUrl: formData.get("websiteUrl") || "",
    sizeRange: formData.get("sizeRange") || undefined,
    headquartersCity: formData.get("headquartersCity") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields." };

  await prisma.company.update({
    where: { id: membership.companyId },
    data: {
      name: parsed.data.name,
      about: parsed.data.about,
      industry: parsed.data.industry,
      websiteUrl: parsed.data.websiteUrl || null,
      sizeRange: parsed.data.sizeRange,
      headquartersCity: parsed.data.headquartersCity,
    },
  });

  revalidatePath("/employer/company");
  return { ok: true, message: "Company profile updated." };
}

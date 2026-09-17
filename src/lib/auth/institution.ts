import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRoleOrRedirect } from "@/lib/auth/rbac";

export async function requireInstitutionMembership() {
  const session = await requireRoleOrRedirect(["INSTITUTION", "EDUCATOR"]);
  const membership = await prisma.institutionMember.findFirst({
    where: { userId: session.user.id },
    include: { institution: true },
  });
  if (!membership) redirect("/institutions");
  return { session, membership };
}

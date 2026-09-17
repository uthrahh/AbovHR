import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRoleOrRedirect } from "@/lib/auth/rbac";

export async function requireEmployerMembership() {
  const session = await requireRoleOrRedirect(["EMPLOYER", "RECRUITER"]);
  const membership = await prisma.employerMember.findFirst({
    where: { userId: session.user.id },
    include: { company: true },
  });
  if (!membership) {
    redirect("/employers");
  }
  return { session, membership };
}

/** Throws-style variant for Server Actions where a redirect isn't appropriate. */
export async function requireEmployerMembershipStrict(userId: string) {
  const membership = await prisma.employerMember.findFirst({ where: { userId }, include: { company: true } });
  if (!membership) throw new Error("No employer company associated with this account.");
  return membership;
}

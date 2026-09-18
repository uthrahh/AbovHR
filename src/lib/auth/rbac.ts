import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { UserRole } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Not authorized to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Server Component/Route Handler guard: redirects unauthenticated users to sign-in. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return session;
}

/** Server Action/API guard: throws instead of redirecting, for callers that need to return an error shape. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session.user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError(`This action requires one of: ${roles.join(", ")}.`);
  }
  return user;
}

/** Server Component guard variant of requireRole that redirects instead of throwing. */
export async function requireRoleOrRedirect(roles: UserRole[], redirectTo = "/") {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    redirect(redirectTo);
  }
  return session;
}

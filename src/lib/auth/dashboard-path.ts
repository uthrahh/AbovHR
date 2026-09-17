import type { UserRole } from "@/generated/prisma/enums";

export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "CANDIDATE":
      return "/dashboard";
    case "EMPLOYER":
    case "RECRUITER":
      return "/employer/dashboard";
    case "INSTITUTION":
    case "EDUCATOR":
      return "/institution/dashboard";
    case "ADMIN":
      return "/admin";
    default:
      return "/dashboard";
  }
}

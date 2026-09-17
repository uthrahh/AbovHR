import { requireRoleOrRedirect } from "@/lib/auth/rbac";
import { AdminTabs } from "@/components/layout/admin-tabs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect(["ADMIN"]);
  return (
    <div>
      <AdminTabs />
      {children}
    </div>
  );
}

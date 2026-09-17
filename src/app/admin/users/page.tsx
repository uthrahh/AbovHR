import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { setUserStatusAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin — users" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">All platform users with role, status, and moderation actions</caption>
          <thead className="bg-[var(--color-surface-sunken)]">
            <tr className="text-left">
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">Name</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">Email</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">Role</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                <td className="px-4 py-3 text-[var(--color-text-primary)]">{user.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{user.email}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{user.role}</td>
                <td className="px-4 py-3">
                  <Badge tone={user.status === "ACTIVE" ? "success" : "error"}>{user.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {user.role !== "ADMIN" && (
                    <form action={setUserStatusAction.bind(null, user.id, user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")}>
                      <button type="submit" className="text-sm font-medium text-[var(--color-accent-text)] underline">
                        {user.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";

export type DataRequestState = { ok: boolean; message: string } | undefined;

export async function submitDataRequestAction(type: "EXPORT" | "DELETE", _prevState: DataRequestState): Promise<DataRequestState> {
  const user = await requireUser();

  const existing = await prisma.dataRequest.findFirst({
    where: { userId: user.id, type, status: { in: ["PENDING", "IN_PROGRESS"] } },
  });
  if (existing) {
    return { ok: true, message: `You already have a ${type.toLowerCase()} request in progress.` };
  }

  await prisma.dataRequest.create({ data: { userId: user.id, type } });

  revalidatePath("/data-request");
  return {
    ok: true,
    message:
      type === "EXPORT"
        ? "Export request submitted. We'll prepare your data and notify you when it's ready."
        : "Deletion request submitted. Your account will be scheduled for removal — see this page for what that includes.",
  };
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import { CONSENT_POLICY_VERSION } from "@/lib/consent";

const bodySchema = z.object({
  preferences: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
});

export async function POST(request: Request) {
  const { ok } = rateLimit(clientKeyFromRequest(request, "consent"), 20, 60_000);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid consent payload." }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  await prisma.consentRecord.createMany({
    data: [
      {
        userId,
        consentType: "COOKIE_ANALYTICS",
        granted: parsed.data.analytics,
        policyVersion: CONSENT_POLICY_VERSION,
      },
      {
        userId,
        consentType: "COOKIE_MARKETING",
        granted: parsed.data.marketing,
        policyVersion: CONSENT_POLICY_VERSION,
      },
    ],
  });

  return NextResponse.json({ ok: true });
}

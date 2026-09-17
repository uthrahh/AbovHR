"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema, candidateRegisterSchema, employerRegisterSchema } from "@/lib/validation/auth";
import { CONSENT_POLICY_VERSION } from "@/lib/consent";
import { dashboardPathForRole } from "@/lib/auth/dashboard-path";

export type AuthFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

async function requestKey(scope: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${scope}:${ip}`;
}

export async function signInAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { ok } = rateLimit(await requestKey("sign-in"), 10, 60_000);
  if (!ok) return { error: "Too many sign-in attempts. Please wait a minute and try again." };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const next = (formData.get("next") as string | null) || undefined;

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { role: true } });
  const fallback = existingUser ? dashboardPathForRole(existingUser.role) : "/dashboard";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: next && next.startsWith("/") ? next : fallback,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "That email and password combination doesn't match our records." };
      }
      return { error: "Something went wrong signing you in. Please try again." };
    }
    throw error;
  }
  return undefined;
}

export async function candidateRegisterAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { ok } = rateLimit(await requestKey("register"), 8, 60_000);
  if (!ok) return { error: "Too many attempts. Please wait a minute and try again." };

  const parsed = candidateRegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    termsAccepted: formData.get("termsAccepted") === "on",
    marketingConsent: formData.get("marketingConsent") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with this email already exists. Try signing in instead." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: "CANDIDATE",
      passwordHash,
      candidateProfile: { create: {} },
      notificationPref: { create: { marketingEmails: parsed.data.marketingConsent } },
    },
  });

  await prisma.consentRecord.createMany({
    data: [
      { userId: user.id, consentType: "TERMS_OF_SERVICE", granted: true, policyVersion: CONSENT_POLICY_VERSION },
      { userId: user.id, consentType: "MARKETING_EMAIL", granted: parsed.data.marketingConsent, policyVersion: CONSENT_POLICY_VERSION },
    ],
  });

  try {
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Account created — please sign in." };
    throw error;
  }
  return undefined;
}

export async function employerRegisterAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { ok } = rateLimit(await requestKey("register"), 8, 60_000);
  if (!ok) return { error: "Too many attempts. Please wait a minute and try again." };

  const parsed = employerRegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
    termsAccepted: formData.get("termsAccepted") === "on",
    marketingConsent: formData.get("marketingConsent") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with this email already exists. Try signing in instead." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  let slug = parsed.data.companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slugTaken = await prisma.company.findUnique({ where: { slug } });
  if (slugTaken) slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: "EMPLOYER",
      passwordHash,
      notificationPref: { create: { marketingEmails: parsed.data.marketingConsent } },
    },
  });

  const company = await prisma.company.create({
    data: { name: parsed.data.companyName, slug },
  });

  await prisma.employerMember.create({
    data: { userId: user.id, companyId: company.id, role: "OWNER" },
  });

  await prisma.subscription.create({
    data: { companyId: company.id, plan: "FREE", status: "TRIALING" },
  });

  await prisma.consentRecord.createMany({
    data: [
      { userId: user.id, consentType: "TERMS_OF_SERVICE", granted: true, policyVersion: CONSENT_POLICY_VERSION },
      { userId: user.id, consentType: "MARKETING_EMAIL", granted: parsed.data.marketingConsent, policyVersion: CONSENT_POLICY_VERSION },
    ],
  });

  try {
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: "/employer/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Account created — please sign in." };
    throw error;
  }
  return undefined;
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

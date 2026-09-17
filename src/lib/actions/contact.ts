"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(3000),
});

export type ContactFormState = { ok: boolean; message: string } | undefined;

export async function submitContactFormAction(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Honeypot: a field hidden from real users via CSS. Bots that fill every
  // field will populate this one; humans never see or touch it.
  if (formData.get("company_website")) {
    return { ok: true, message: "Thanks — we'll get back to you soon." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!ok) return { ok: false, message: "Too many messages sent. Please wait a minute and try again." };

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, message: "Please fill in every field with a valid value." };

  await prisma.contactMessage.create({ data: parsed.data });

  return { ok: true, message: "Thanks — we'll get back to you soon." };
}

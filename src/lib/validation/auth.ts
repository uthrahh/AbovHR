import { z } from "zod";

// NIST 800-63B favors length over forced complexity — we require length and
// check against a small common-password blocklist rather than mandating
// arbitrary symbol/number rules that push users toward predictable patterns.
const COMMON_PASSWORDS = new Set([
  "password", "password1", "12345678", "123456789", "qwertyuiop",
  "letmein11", "welcome11", "abov1234", "changeme1",
]);

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(128, "Password is too long.")
  .refine((val) => !COMMON_PASSWORDS.has(val.toLowerCase()), {
    message: "This password is too common. Please choose another.",
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const candidateRegisterSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: passwordSchema,
  termsAccepted: z.literal(true, {
    error: "You must accept the Terms of Service to continue.",
  }),
  marketingConsent: z.boolean().optional().default(false),
});

export const employerRegisterSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: passwordSchema,
  companyName: z.string().trim().min(2, "Enter your company name.").max(160),
  termsAccepted: z.literal(true, {
    error: "You must accept the Terms of Service to continue.",
  }),
  marketingConsent: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CandidateRegisterInput = z.infer<typeof candidateRegisterSchema>;
export type EmployerRegisterInput = z.infer<typeof employerRegisterSchema>;

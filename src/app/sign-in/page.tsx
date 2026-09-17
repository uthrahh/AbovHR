import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <AuthShell
      title="Sign in to Abov"
      subtitle="Access your applications, saved jobs, and learning progress."
      footer={
        <>
          Hiring instead?{" "}
          <Link href="/employers/sign-up" className="font-medium underline">
            Create an employer account
          </Link>
        </>
      }
    >
      <SignInForm next={next} />
    </AuthShell>
  );
}

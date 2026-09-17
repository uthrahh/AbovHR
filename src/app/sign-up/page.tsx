import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { CandidateRegisterForm } from "@/components/auth/candidate-register-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your Abov account"
      subtitle="Find jobs, track applications, and get a personalized learning plan."
      footer={
        <>
          Hiring instead?{" "}
          <Link href="/employers/sign-up" className="font-medium underline">
            Create an employer account
          </Link>
        </>
      }
    >
      <CandidateRegisterForm />
    </AuthShell>
  );
}

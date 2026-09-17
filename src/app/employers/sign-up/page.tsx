import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { EmployerRegisterForm } from "@/components/auth/employer-register-form";

export const metadata: Metadata = { title: "Create an employer account" };

export default function EmployerSignUpPage() {
  return (
    <AuthShell
      title="Hire on Abov"
      subtitle="Post jobs, review applicants, and manage your hiring pipeline."
      footer={
        <>
          Looking for a job instead?{" "}
          <Link href="/sign-up" className="font-medium underline">
            Create a candidate account
          </Link>
        </>
      }
    >
      <EmployerRegisterForm />
    </AuthShell>
  );
}

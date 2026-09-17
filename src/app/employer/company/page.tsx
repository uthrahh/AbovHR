import type { Metadata } from "next";
import { requireEmployerMembership } from "@/lib/auth/employer";
import { CompanyForm } from "@/components/employer/company-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Company profile" };

export default async function EmployerCompanyPage() {
  const { membership } = await requireEmployerMembership();
  const company = membership.company;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Company profile</h1>
        <Badge tone={company.verificationStatus === "VERIFIED" ? "success" : "neutral"}>{company.verificationStatus}</Badge>
      </div>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        This information appears on your public company page and job listings.
      </p>

      <div className="mt-6">
        <CompanyForm
          defaults={{
            name: company.name,
            about: company.about ?? "",
            industry: company.industry ?? "",
            websiteUrl: company.websiteUrl ?? "",
            sizeRange: company.sizeRange ?? "",
            headquartersCity: company.headquartersCity ?? "",
          }}
        />
      </div>
    </div>
  );
}

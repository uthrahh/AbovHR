import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { BriefcaseIcon, UserIcon, ChartIcon, ShieldIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "For employers",
  description: "Post jobs, track applicants through a hiring pipeline, and see transparent match scores on Abov.",
};

const FEATURES = [
  {
    icon: BriefcaseIcon,
    title: "Post jobs in minutes",
    description: "Publish immediately or save a draft. Set employment type, work mode, experience range, and required skills.",
  },
  {
    icon: UserIcon,
    title: "Manage applicants in one pipeline",
    description: "Move candidates through Applied, Screening, Shortlisted, Interview, Assessment, Offer, and Hired — with internal notes on each application.",
  },
  {
    icon: ChartIcon,
    title: "See match scores, not guesswork",
    description: "Every applicant shows a transparent compatibility score based on skills, experience, and location — the same scoring candidates see.",
  },
  {
    icon: ShieldIcon,
    title: "Role-based access for your team",
    description: "Invite teammates with owner, admin, or recruiter permissions scoped to your company's jobs and applicants.",
  },
];

export default function EmployersMarketingPage() {
  return (
    <div>
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-display text-3xl text-[var(--color-text-primary)] sm:text-4xl">Find and hire the right people</h1>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Post jobs, track applicants, and move candidates through your hiring pipeline — with transparent match scoring
            throughout.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/employers/sign-up" size="lg">
              Create an employer account
            </LinkButton>
            <LinkButton href="/employers/services" variant="secondary" size="lg">
              Explore talent services
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <feature.icon width={22} height={22} className="text-[var(--color-accent-text)]" />
              <h2 className="mt-3 font-medium text-[var(--color-text-primary)]">{feature.title}</h2>
              <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

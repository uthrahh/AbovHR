import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { GraduationCapIcon, ChartIcon, TargetIcon, BriefcaseIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "For institutions",
  description: "Support student career development, skill assessments, and placement tracking through Abov.",
};

const FEATURES = [
  { icon: GraduationCapIcon, title: "Cohort management", description: "Organize students into cohorts and track their career readiness as a group." },
  { icon: TargetIcon, title: "Career assessments", description: "Students can take the same career assessment candidates use, connected to your institution's records." },
  { icon: ChartIcon, title: "Skill and learning progress", description: "See aggregate skill gaps and learning-path progress across a cohort, not just individual students." },
  { icon: BriefcaseIcon, title: "Placement visibility", description: "Track which students are applying, interviewing, and receiving offers through the same job marketplace candidates use." },
];

export default function InstitutionsMarketingPage() {
  return (
    <div>
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-display text-3xl text-[var(--color-text-primary)] sm:text-4xl">Support your students' careers</h1>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Give students career assessments, skill-gap analysis, and access to the same job marketplace candidates use —
            with visibility into their progress as a cohort.
          </p>
          <div className="mt-7">
            <LinkButton href="/contact" size="lg">
              Talk to us about your institution
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

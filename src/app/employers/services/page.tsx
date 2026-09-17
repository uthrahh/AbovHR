import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Talent services",
  description: "Recruitment, workforce, learning, and HR advisory services offered alongside the Abov platform.",
};

const SERVICE_GROUPS = [
  {
    title: "Recruitment",
    items: ["Permanent hiring support", "Executive search", "Recruitment process outsourcing (RPO)", "Contract staffing"],
  },
  {
    title: "Workforce",
    items: ["Staffing", "Workforce planning", "Talent sourcing"],
  },
  {
    title: "Learning",
    items: ["Upskilling programs", "Reskilling programs", "Corporate learning", "Custom training programs"],
  },
  {
    title: "HR advisory",
    items: ["HR strategy", "Workforce advisory", "Compliance support"],
  },
  {
    title: "Talent technology",
    items: ["Talent assessment tooling", "HR analytics", "Learning systems integration", "Talent engagement"],
  },
];

export default function TalentServicesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Talent services</h1>
      <p className="mt-2 max-w-2xl text-base text-[var(--color-text-secondary)]">
        Beyond the self-serve platform, Abov HR offers advisory and delivery services for companies that need more hands-on
        support with hiring and workforce development. These are engaged separately from your Abov account — reach out to
        scope what you need.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SERVICE_GROUPS.map((group) => (
          <div key={group.title} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-medium text-[var(--color-text-primary)]">{group.title}</h2>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--color-text-secondary)]">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-muted)]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-6 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">Tell us what you're trying to solve and we'll get back to you.</p>
        <LinkButton href="/contact" className="mt-3">
          Contact the team
        </LinkButton>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Looking for the self-serve job posting and applicant tracking tools instead?{" "}
          <Link href="/employers" className="underline">
            See the employer platform
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

export function LegalLayout({
  title,
  lastUpdated,
  intro,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Last updated: {lastUpdated}</p>
      {intro && <p className="mt-4 text-base text-[var(--color-text-secondary)]">{intro}</p>}

      <div className="legal-prose mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
        {children}
      </div>

      <div className="mt-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-4 text-sm text-[var(--color-text-muted)]">
        This page is provided for informational purposes and reflects how Abov is designed to handle data as of the date above.
        It is not a substitute for legal advice — consult qualified counsel to confirm compliance with the laws that apply to your
        use of the platform.
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg text-[var(--color-text-primary)]">{heading}</h2>
      <div className="mt-2 flex flex-col gap-3">{children}</div>
    </section>
  );
}

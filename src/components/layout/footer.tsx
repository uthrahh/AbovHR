import Link from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { href: "/jobs", label: "Find jobs" },
      { href: "/career", label: "Career paths" },
      { href: "/learn", label: "Learning" },
      { href: "/resources", label: "Resources" },
    ],
  },
  {
    title: "Employers",
    links: [
      { href: "/employers", label: "Hire on Abov" },
      { href: "/employers/services", label: "Talent services" },
      { href: "/employer/dashboard", label: "Employer dashboard" },
    ],
  },
  {
    title: "Institutions",
    links: [
      { href: "/institutions", label: "For institutions" },
      { href: "/institution/dashboard", label: "Institution dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy-policy", label: "Privacy policy" },
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/cookie-policy", label: "Cookie policy" },
      { href: "/legal/refund-policy", label: "Refund policy" },
      { href: "/data-request", label: "Manage my data" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{col.title}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] no-underline hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} Abov HR. A career, hiring, and learning platform operating in India.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Demo product build — see{" "}
            <Link href="/legal/privacy-policy" className="underline">
              privacy policy
            </Link>{" "}
            for data handling details.
          </p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/legal-layout";

export const metadata: Metadata = { title: "Cookie policy" };

const COOKIES = [
  {
    category: "Necessary",
    purpose: "Keeps you signed in, remembers your cookie choice, and protects against cross-site request abuse.",
    examples: "Session/auth token, cookie-consent preference",
    canDisable: "No — required for the site to function.",
  },
  {
    category: "Preferences",
    purpose: "Remembers non-essential settings, like a previously used filter, across visits.",
    examples: "Not currently set by this build.",
    canDisable: "Yes, via the cookie banner or the preferences link below.",
  },
  {
    category: "Analytics",
    purpose: "Would help us understand aggregate product usage (e.g. which pages are visited).",
    examples: "No analytics provider is integrated in this build — nothing is set under this category yet.",
    canDisable: "Yes.",
  },
  {
    category: "Marketing",
    purpose: "Would personalize marketing communications or ads.",
    examples: "Not used by this build.",
    canDisable: "Yes.",
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie policy"
      lastUpdated="18 September 2026"
      intro="This page lists the cookies and similar technologies Abov uses, grouped by category, and how to control them."
    >
      <LegalSection heading="How consent works here">
        <p>
          On your first visit, a banner lets you accept all optional categories, reject them, or choose which ones to allow.
          Necessary cookies are never optional. Nothing outside the necessary category is loaded until you've made a choice —
          we don't set analytics or marketing cookies by default.
        </p>
      </LegalSection>

      <LegalSection heading="Cookie categories">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <caption className="sr-only">Cookie categories used by Abov, their purpose, examples, and whether they can be disabled</caption>
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                <th scope="col" className="py-2 pr-4 font-semibold text-[var(--color-text-primary)]">Category</th>
                <th scope="col" className="py-2 pr-4 font-semibold text-[var(--color-text-primary)]">Purpose</th>
                <th scope="col" className="py-2 pr-4 font-semibold text-[var(--color-text-primary)]">What's set today</th>
                <th scope="col" className="py-2 font-semibold text-[var(--color-text-primary)]">Can you disable it?</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((row) => (
                <tr key={row.category} className="border-b border-[var(--color-border)] align-top">
                  <th scope="row" className="py-3 pr-4 font-medium text-[var(--color-text-primary)]">{row.category}</th>
                  <td className="py-3 pr-4">{row.purpose}</td>
                  <td className="py-3 pr-4">{row.examples}</td>
                  <td className="py-3">{row.canDisable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection heading="Other technologies">
        <p>
          Fonts are self-hosted through Next.js (no request to a third-party font CDN at runtime). This build does not embed
          third-party video players, maps, chat widgets, or CAPTCHA — if any of these are added later, this page and the
          consent categories above will be updated first.
        </p>
      </LegalSection>

      <LegalSection heading="Changing your choice">
        <p>You can change your cookie preferences at any time by clearing your browser's site data for this domain, which will show the consent banner again on your next visit. A persistent in-page &quot;manage preferences&quot; control is planned.</p>
      </LegalSection>
    </LegalLayout>
  );
}

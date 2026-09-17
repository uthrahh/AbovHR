import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/legal-layout";

export const metadata: Metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <LegalLayout
      title="Accessibility statement"
      lastUpdated="18 September 2026"
      intro="Abov is designed and built against WCAG 2.2 Level AA as a target standard. This page describes our approach and how to report an issue."
    >
      <LegalSection heading="What we've built in">
        <ul className="list-disc pl-5">
          <li>Semantic landmarks (header, navigation, main, footer) and a heading structure on every page.</li>
          <li>A &quot;skip to main content&quot; link for keyboard users.</li>
          <li>Visible focus outlines on every interactive element, distinct from hover and error states.</li>
          <li>Labeled form fields with programmatically associated errors and hints, not color-only error states.</li>
          <li>Keyboard-operable navigation, filters, and modals, including focus trapping and Escape-to-close on dialogs.</li>
          <li>Color combinations chosen to meet WCAG AA contrast ratios for text and meaningful UI elements.</li>
          <li>Respect for <code>prefers-reduced-motion</code> — animations are minimal and shortened for users who request it.</li>
          <li>Alt text on meaningful images; decorative icons are hidden from assistive technology.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Known gaps">
        <p>
          This is an actively developed build. Areas that still need a dedicated accessibility pass before this could be
          considered production-ready include: a full screen-reader walkthrough of the employer ATS pipeline and multi-step
          forms, verification of table semantics on data-heavy dashboard views, and a formal audit against WCAG 2.2's newer
          success criteria (e.g. focus appearance, dragging movements) by someone using assistive technology day-to-day.
        </p>
      </LegalSection>

      <LegalSection heading="Reporting an issue">
        <p>
          If you experience an accessibility barrier anywhere on Abov, please tell us through the{" "}
          <Link href="/contact" className="underline">
            contact page
          </Link>
          . Include the page URL and, if possible, the assistive technology and browser you were using — it helps us
          reproduce and fix the issue faster.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

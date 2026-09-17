import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/legal-layout";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund policy"
      lastUpdated="18 September 2026"
      intro="Abov does not currently charge for any feature. This page describes the policy that would apply once paid employer plans go live."
    >
      <LegalSection heading="Current state">
        <p>
          No payment processor is connected to this build, and no plan, subscription, or feature currently charges real
          money. The subscription plans visible on employer accounts (Free, Growth, Scale) are shown for product and design
          purposes only. If you see a &quot;Growth&quot; or &quot;Scale&quot; plan on an employer account, it reflects planned
          tiering, not an active billing relationship.
        </p>
      </LegalSection>

      <LegalSection heading="What will apply once billing is enabled">
        <p>Once a real payment provider is integrated, the following would govern paid employer plans:</p>
        <ul className="list-disc pl-5">
          <li><strong>Eligible purchases</strong> — employer subscription plans and any paid add-on features, billed to the company account that purchased them.</li>
          <li><strong>Refund window</strong> — a defined window (to be set before launch, informed by applicable Indian consumer protection requirements) during which an unused subscription can be cancelled for a full refund.</li>
          <li><strong>Subscription cancellation</strong> — cancelling stops future billing; it does not retroactively refund the current billing period except within the refund window above.</li>
          <li><strong>Non-refundable items</strong> — usage already consumed within a billing period (e.g., job posts already published) would typically not be refundable outside the window.</li>
          <li><strong>Processing time</strong> — approved refunds would be returned to the original payment method within the payment provider's standard processing time (typically 5–10 business days).</li>
          <li><strong>How to request one</strong> — through the <Link href="/contact" className="underline">contact page</Link>, referencing the company account and invoice.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Before this applies">
        <p>
          This policy will be finalized against the specific payment provider integrated and reviewed for consistency with
          Indian consumer protection and e-commerce rules before any real transaction takes place.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

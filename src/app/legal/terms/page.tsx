import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/legal-layout";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of service"
      lastUpdated="18 September 2026"
      intro="These terms govern your use of Abov. By creating an account, you agree to them."
    >
      <LegalSection heading="What Abov is">
        <p>
          Abov is a platform for finding jobs and internships, exploring career paths, building skills, and connecting
          candidates with employers and institutions. Abov is not a party to any employment relationship formed between a
          candidate and an employer — we provide the platform that connects you, not the job itself.
        </p>
      </LegalSection>

      <LegalSection heading="Accounts and roles">
        <p>
          You must provide accurate information when creating an account and keep your password secure. Accounts are
          role-based (candidate, employer, recruiter, institution, educator, or admin) and you may only access features and
          data appropriate to your role. You're responsible for activity that happens under your account.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5">
          <li>Post false, misleading, or discriminatory job listings or profile information.</li>
          <li>Use the platform to collect candidate or company data for purposes unrelated to legitimate hiring or job-seeking.</li>
          <li>Attempt to bypass rate limits, security controls, or access data you're not authorized to see.</li>
          <li>Upload malicious files or content that infringes someone else's intellectual property.</li>
          <li>Use automated tools to scrape the platform at scale without permission.</li>
        </ul>
        <p>We may suspend or terminate accounts that violate these terms, following our moderation process where practicable.</p>
      </LegalSection>

      <LegalSection heading="Content you provide">
        <p>
          You retain ownership of the content you upload (resumes, profile information, job postings, messages). By posting
          content, you grant Abov a license to display and process it as needed to operate the platform — for example,
          showing your resume to an employer you applied to. Job postings and company information are provided by employers,
          who are responsible for their accuracy.
        </p>
      </LegalSection>

      <LegalSection heading="No guarantees of outcomes">
        <p>
          Abov helps you discover jobs, assess skill gaps, and plan learning — it does not guarantee you a job, a particular
          salary, or a specific career outcome. Match scores and career suggestions are calculated from the information in
          your profile and platform data; they are decision support, not a promise of results.
        </p>
      </LegalSection>

      <LegalSection heading="Paid features">
        <p>
          Some employer features (for example, higher usage tiers) may be offered as paid plans. Where payment processing is
          actually enabled, pricing and billing terms will be presented at the point of purchase, and our{" "}
          <Link href="/legal/refund-policy" className="underline">
            refund policy
          </Link>{" "}
          will apply. No payment processor is integrated in this build, and no paid feature currently charges real money.
        </p>
      </LegalSection>

      <LegalSection heading="Termination">
        <p>
          You can stop using Abov and request account deletion at any time via the{" "}
          <Link href="/data-request" className="underline">
            data request
          </Link>{" "}
          page. We may suspend or terminate accounts for violations of these terms, extended inactivity, or as required by
          law.
        </p>
      </LegalSection>

      <LegalSection heading="Disclaimers and liability">
        <p>
          The platform is provided &quot;as is.&quot; To the maximum extent permitted by law, Abov is not liable for indirect
          or consequential damages arising from your use of the platform, including hiring decisions made by employers or
          career decisions made based on platform content.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <p>We may update these terms as the platform evolves. Material changes will be reflected by updating the date at the top of this page.</p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms can be sent through the{" "}
          <Link href="/contact" className="underline">
            contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

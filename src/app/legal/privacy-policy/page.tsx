import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/legal-layout";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy policy"
      lastUpdated="18 September 2026"
      intro="This policy explains what personal data Abov collects, why, how it's used, who it's shared with, and the choices and rights you have over it."
    >
      <LegalSection heading="Who this applies to">
        <p>
          This policy covers candidates, employers, recruiters, institution and educator accounts, and visitors to abov.example
          (this build has no live production domain yet). Abov HR is the data controller for information collected through the
          platform.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect and why">
        <p>We collect the following categories of personal data. Each is tied to a specific product function — we don&rsquo;t collect data we don&rsquo;t have a use for.</p>
        <ul className="list-disc pl-5">
          <li><strong>Account data</strong> — name, email, password (stored as a salted hash, never in plain text), account role. Used to authenticate you and operate your account.</li>
          <li><strong>Candidate profile data</strong> — education, work experience, skills, projects, certifications, languages, salary expectations, location and work preferences, resume files. Used to calculate job match scores, power search and recommendations, and share with employers when you apply to their jobs.</li>
          <li><strong>Employer and company data</strong> — company name, description, size, industry, job postings, and information about your hiring team. Used to run your employer account and display your jobs and company profile to candidates.</li>
          <li><strong>Application and interview data</strong> — jobs you apply to, application status, interview scheduling, employer notes attached to your application. Used to run the hiring pipeline between you and an employer.</li>
          <li><strong>Learning and assessment data</strong> — career assessment responses, learning path progress, skill self-ratings. Used to generate career and learning suggestions and track your progress.</li>
          <li><strong>Consent and preference records</strong> — cookie choices, marketing email opt-in/opt-out, terms acceptance, with a timestamp and policy version. Used to demonstrate and honor your choices.</li>
          <li><strong>Technical data</strong> — IP address (used transiently for rate-limiting abusive requests; see the cookie policy for what&rsquo;s stored longer-term), session tokens, basic request logs. Used for security and to keep you signed in.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Legal basis for processing (India — DPDP Act, 2023)">
        <p>
          Where the Digital Personal Data Protection Act, 2023 (DPDP Act) applies, we process personal data on the following
          bases: your <strong>consent</strong> (for example, creating an account, uploading a resume, or opting into marketing
          email), and <strong>legitimate use</strong> as contemplated under the Act for purposes like fulfilling a request you&rsquo;ve
          made of us (for example, submitting a job application) or for security and fraud prevention. Where we rely on consent,
          you can withdraw it at any time through your account settings or by contacting us — see &quot;Your rights&quot; below.
        </p>
      </LegalSection>

      <LegalSection heading="Who we share data with">
        <p>
          <strong>Employers and institutions</strong> — when you apply to a job, the employer&rsquo;s hiring team can see your
          candidate profile, resume, and application details for that job. Institution staff can see progress data for students
          in cohorts they administer.
        </p>
        <p>
          <strong>Service providers</strong> — this build currently runs on a self-hosted PostgreSQL database and local file
          storage with no third-party analytics, advertising, or marketing SDKs integrated (see the cookie policy and the
          third-party inventory in our engineering documentation). A production deployment would add a small number of
          processors — for example, cloud hosting, object storage for resumes, and possibly email delivery — each of which
          would be listed here by name before going live, along with its role and location.
        </p>
        <p>
          <strong>Legal and safety</strong> — we may disclose data if required by law, to enforce our Terms of Service, or to
          protect the rights, safety, or property of Abov, our users, or the public.
        </p>
        <p>We do not sell personal data.</p>
      </LegalSection>

      <LegalSection heading="Data retention">
        <p>
          We retain account and profile data for as long as your account is active. If you delete your account (see{" "}
          <Link href="/data-request" className="underline">
            manage my data
          </Link>
          ), we remove or anonymize personal data within a reasonable period, except where we&rsquo;re required to retain records
          longer for legal, tax, or dispute-resolution purposes (for example, records of a completed hiring transaction).
          Application records tied to a specific employer&rsquo;s job may be retained by that employer separately from your Abov
          account per their own record-keeping obligations.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>Subject to applicable law, you can:</p>
        <ul className="list-disc pl-5">
          <li>Access and review the personal data we hold about you (most of it is visible directly in your profile and dashboard).</li>
          <li>Correct inaccurate data by editing your profile directly.</li>
          <li>Request export or deletion of your data via the <Link href="/data-request" className="underline">data request</Link> page.</li>
          <li>Withdraw consent for optional processing (like marketing email) at any time.</li>
          <li>Raise a grievance about how your data has been handled — see &quot;Contact and grievance redressal&quot; below.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Children's data">
        <p>
          Abov is built for job seekers, students, and professionals, and some candidate and institution users may be under 18
          (for example, students exploring internships through a school or college cohort). We have not yet implemented
          age verification or the verifiable parental/guardian consent mechanism the DPDP Act requires for processing a
          child&rsquo;s personal data. This is flagged as an open item in our compliance risk register and must be resolved before
          onboarding users known to be under 18 in production.
        </p>
      </LegalSection>

      <LegalSection heading="International users">
        <p>
          Abov is built with an India-first operating model. If the platform serves users outside India in the future, other
          privacy regimes — such as the GDPR/UK GDPR or U.S. state laws like the CCPA/CPRA — may also apply depending on where
          those users are located, and this policy would be updated accordingly before that expansion.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          We use password hashing, role-based access control, server-side authorization checks, and input validation
          throughout the platform. No method of transmission or storage is perfectly secure; see our{" "}
          <Link href="/accessibility" className="underline">
            accessibility statement
          </Link>{" "}
          and engineering documentation for more detail on our current security posture and known gaps.
        </p>
      </LegalSection>

      <LegalSection heading="Contact and grievance redressal">
        <p>
          For privacy questions, data requests, or grievances, contact us through the{" "}
          <Link href="/contact" className="underline">
            contact page
          </Link>
          . A named grievance officer (as contemplated under the DPDP Act) would be designated and listed here before this
          platform operates in production with real user data.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

# Legal & compliance risk register, and IP/asset register

This is a working risk register, not a compliance certificate. Nothing in this repository should be read as "Abov is legally compliant" — several rows below are explicitly marked **NEEDS LEGAL REVIEW**.

## Legal & compliance risk register

| Requirement | Why it matters | Current implementation | Remaining action | Owner | Severity |
|---|---|---|---|---|---|
| DPDP Act 2023 — consent-based processing | Primary Indian data-protection law governing this platform | Consent captured for terms/marketing/cookies, recorded with policy version and timestamp (`ConsentRecord`) | Legal review of consent language against final DPDP Rules once notified | Legal + Eng | **NEEDS LEGAL REVIEW** |
| DPDP Act — children's data | Some candidates/students may be minors (internship/college users) | Not implemented — no age gate, no verifiable parental/guardian consent flow | Build age verification + guardian consent before onboarding known-minor users | Eng + Legal | High — **NEEDS IMPLEMENTATION** |
| DPDP Act — grievance officer | Required contact point for data grievances | Contact page exists; no named grievance officer designated | Name a real officer, publish contact details on the privacy policy | Legal | **NEEDS LEGAL REVIEW** |
| DPDP Act — data principal rights (access/correction/erasure) | Core user rights under the Act | `/data-request` lets a signed-in user request export or deletion; requests are recorded (`DataRequest`) | Build the actual automated fulfillment pipeline (currently intake-only) | Eng | Medium — **NEEDS IMPLEMENTATION** |
| Consumer protection / e-commerce rules (if payments launch) | Refund and cancellation rules for paid plans | `/legal/refund-policy` states current state honestly (no real payments) and drafts what would apply | Finalize against the actual payment provider and Indian consumer-protection requirements before enabling billing | Legal | **NEEDS LEGAL REVIEW before billing launches** |
| International users (GDPR/CCPA, etc.) | Only relevant if Abov serves non-Indian users | Privacy policy flags this as a future consideration, not yet applicable | Revisit if/when the platform expands outside India | Legal | Low (not currently applicable) |
| Employment/recruitment-specific regulation | Job platforms can carry sector-specific obligations (e.g. anti-discrimination in job ads) | Employer job-posting copy guidance encourages honest, non-discriminatory listings (see the "writing job postings" resource article); no automated content moderation for discriminatory language yet | Consider automated + human moderation for job posting content before scaling employer self-serve | Legal + Product | Medium |
| Accessibility law (e.g. RPwD Act, 2016 in India) | Legal accessibility obligations alongside WCAG best practice | Built against WCAG 2.2 AA as a target (see `docs/audits.md`); not independently audited | Commission an external accessibility audit before claiming compliance publicly | Legal + Eng | **NEEDS LEGAL REVIEW** |
| Marketing/email consent (unsolicited commercial communication rules) | Marketing consent must be separate from mandatory terms acceptance | Registration forms use two distinct checkboxes — terms (required) and marketing (optional, unchecked by default) | None outstanding at this stage (no email sending exists yet to test against) | Eng | Low |
| Cookie consent | Legally required in several jurisdictions for non-essential tracking | Full accept/reject/customize UI; nothing non-essential loads before consent, because nothing non-essential is integrated | Re-verify once an analytics/marketing script is actually added | Eng | Low today, revisit on integration |
| Contract terms (Terms of Service) | Governs the platform-candidate-employer relationship | Draft ToS published at `/legal/terms`, covers accounts, acceptable use, content ownership, no-outcome-guarantee, termination | Have counsel review before this is relied upon in a dispute | Legal | **NEEDS LEGAL REVIEW** |
| Intellectual property — platform content | Avoid infringing third parties; protect Abov's own | See IP/asset register below | — | — | — |

## IP / copyright asset register

Every visual and content asset in this build, with its origin:

| Asset | Source | License / basis | Commercial use OK? | Notes |
|---|---|---|---|---|
| "Abov" name, logo mark, wordmark | Created for this project | Original work | Yes | Simple original geometric mark (rounded square + line-drawn ascending arrow), not derived from any competitor's mark. Trademark clearance search was **not** performed — do before real-world launch. |
| Line-icon set (`src/components/ui/icons.tsx`) | Hand-authored SVG paths for this project | Original work | Yes | Deliberately not a third-party icon package, to avoid both a generic look and any per-icon licensing question. |
| Typefaces: Newsreader, IBM Plex Sans | Google Fonts, served via `next/font/google` (self-hosted at build time) | SIL Open Font License (both) | Yes | No runtime dependency on Google's font CDN; license terms permit commercial use and redistribution. |
| All copy (marketing, legal, UI text) | Written for this project | Original work | Yes | No text copied from career-tree.in, cielhr.com, apna.co, or freshedy.com. Those sites were used only as functional/IA research references per the brief, never as copy or layout sources. |
| Seed/demo content (companies, jobs, articles, candidates) | Fictional, authored for this project | Original work | Yes | Company names (e.g. "Northbridge Analytics," "Verdant Systems") are invented and not modeled on real companies; explicitly documented as demo data in `prisma/seed/index.ts` and must not be seeded into a production database. |
| Photographic/stock imagery | None used | N/A | N/A | The product deliberately uses no photography — see the visual-system rationale in `docs/architecture.md`. |
| Testimonials, customer logos, awards, usage statistics | None used | N/A | N/A | Per the build standard: omit rather than fabricate. No such content appears anywhere in the product. |

## Claims audit

A text search of all marketing/legal copy (`src/app/**/page.tsx`, `src/components/**`) for superlative or unsupported claims — "best," "#1," "India's leading," "most trusted," "guaranteed," "100% placement," "thousands of users" — returned no matches. Match scores and career suggestions are consistently framed as "based on your profile, skills, and preferences" / "based on the information you provided," never as guarantees. This should be re-run as part of code review on every future copy change.

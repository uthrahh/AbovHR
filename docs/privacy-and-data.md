# Privacy, data flow, and third-party inventory

## Data flow overview

```
Candidate/Employer browser
   │  (form submit / fetch)
   ▼
Server Action or Route Handler (Next.js, same origin)
   │  zod validation, requireUser()/requireRole() check
   ▼
Prisma Client → PostgreSQL (self-hosted, local in this build)
   │
   ▼
Resume files → local disk (./uploads, outside /public)
              served back only via authenticated /api/resumes/[id]
```

No data leaves the application server to any third party in this build — there is no analytics beacon, no ad pixel, no external API call containing user data. The only external network calls the app itself makes are: none at runtime for user data (fonts are self-hosted via `next/font`, not fetched from Google at request time).

## What's collected, and where it lives

| Data category | Where stored | Who can read it |
|---|---|---|
| Credentials (password) | `User.passwordHash` (bcrypt hash, never plaintext) | Nobody reads it back; only compared at login |
| Candidate profile | `CandidateProfile` + related tables | The candidate; employers only for jobs the candidate applied to; admins |
| Resume files | Local disk (`./uploads`), row in `Resume` | The candidate; employers with a matching application; admins — enforced in `/api/resumes/[id]` |
| Job/company data | `Job`, `Company` | Public (published jobs/companies are meant to be visible) |
| Applications & ATS notes | `Application`, `ApplicationNote`, `ApplicationStatusHistory` | The candidate (their own application status); the hiring company's members; admins |
| Assessment responses | `AssessmentResult.rawResponses` (JSON) | The candidate; admins |
| Consent choices | `ConsentRecord` | The user (implicitly, via their own choices); admins for audit |
| Contact form submissions | `ContactMessage` | Admins only (no UI exposes this list yet — see gaps) |
| Audit log (admin actions) | `AuditLog` | Admins |

## Third-party dependency inventory

| Name | Purpose | Data shared | Status |
|---|---|---|---|
| PostgreSQL | Primary datastore | All application data | Self-hosted (local dev instance in this build) |
| Next.js / Vercel OSS runtime | Application framework | N/A (not a hosted service unless deployed to Vercel) | Open-source, self-hosted here |
| Auth.js (next-auth) | Authentication | N/A (runs in-process) | Open-source library, no external calls |
| bcryptjs | Password hashing | N/A (in-process) | Open-source library |
| Google Fonts (Newsreader, IBM Plex Sans) | Typography | None at runtime — `next/font/google` downloads and self-hosts fonts at **build time**; the browser never requests fonts from Google | No runtime third-party request |
| — Analytics (none integrated) | — | — | **Not integrated.** Cookie consent UI supports an "Analytics" category so that when a provider is added, it's gated behind real consent from day one. |
| — Marketing/ads (none integrated) | — | — | **Not integrated.** |
| — Payment processor (none integrated) | — | — | **Not integrated.** `Subscription`/`Payment` tables are schema-only placeholders. |
| — Email provider (none integrated) | — | — | **Not integrated.** |
| — AI/LLM provider (none integrated) | — | — | **Not integrated.** `ANTHROPIC_API_KEY` is a documented-but-empty env var; setting it alone does not enable anything. |
| — CAPTCHA (none integrated) | — | — | Spam protection currently uses rate limiting + a honeypot field on the contact form, not a CAPTCHA (keeps the form accessible without a third-party challenge). |

## Cookie/tracking inventory

See the live `/legal/cookie-policy` page for the user-facing version. Summary:

| Category | Set by default? | What's actually set today |
|---|---|---|
| Necessary | Yes (always) | Auth session cookie (httpOnly, Secure in production, SameSite=Lax), `abov-consent` cookie (stores the user's own choice) |
| Preferences | No, opt-in | Nothing set yet |
| Analytics | No, opt-in | Nothing set — no analytics provider integrated |
| Marketing | No, opt-in | Nothing set — no marketing tooling integrated |

Consent is captured both client-side (cookie, gates future script loading) and server-side (`ConsentRecord` row per category, for an audit trail), each tagged with a `policyVersion` so a future policy change can be distinguished from a stale consent.

## Legal basis (India-first, DPDP Act 2023)

Processing is grounded in: (a) the user's own consent — account creation, resume upload, optional marketing email, cookie categories; (b) legitimate use for fulfilling the user's own request — e.g., an employer sees an applicant's profile because the candidate applied to that specific job. See `/legal/privacy-policy` for the full user-facing explanation and `docs/legal-and-ip.md` for the compliance risk register, including open items (children's data / verifiable parental consent, grievance officer designation) that must be resolved before real production use.

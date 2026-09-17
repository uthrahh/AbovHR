# Abov — Product Architecture

Company: Abov HR. Product: Abov. This document covers product architecture, the feature map, the page map, the database schema, the auth/RBAC model, and the API architecture, as built in this repository.

## 1. System architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (client)                        │
│   React 19 Server/Client Components · minimal client JS bundle  │
└───────────────────────────────┬───────────────────────────────┘
                                  │ HTTPS
┌───────────────────────────────▼───────────────────────────────┐
│                    Next.js 16 (App Router, Turbopack)           │
│  ┌───────────────┐ ┌────────────────┐ ┌───────────────────────┐ │
│  │ Server         │ │ Route Handlers │ │ Middleware (Edge)     │ │
│  │ Components /   │ │ /api/*         │ │ RBAC route guards,    │ │
│  │ Server Actions  │ │                │ │ session read only     │ │
│  └───────┬────────┘ └───────┬────────┘ └───────────────────────┘ │
└──────────┼──────────────────┼───────────────────────────────────┘
           │                  │
           ▼                  ▼
   ┌───────────────┐  ┌──────────────────┐   ┌────────────────────┐
   │ Prisma Client  │  │ Local disk        │   │ Auth.js v5          │
   │                │  │ file storage       │   │ (Credentials +      │
   │                │  │ (uploads/, outside │   │ JWT session)        │
   │                │  │ /public)           │   │                      │
   └───────┬────────┘  └──────────────────┘   └────────────────────┘
           ▼
   ┌────────────────────┐
   │ PostgreSQL 18        │
   │ (local dev instance) │
   └────────────────────┘
```

- **Frontend**: Next.js App Router, React Server Components by default; Client Components only where interactivity requires it (forms with `useActionState`, filter controls, dialogs).
- **Backend/API**: Server Actions for all mutations (profile edits, job posting, ATS status changes, applications). A small number of Route Handlers (`/api/*`) exist where a REST-style JSON endpoint or file streaming is the right shape (auth callback, resume upload/download, saved-job toggle, consent logging).
- **Database**: PostgreSQL, accessed through Prisma ORM with a typed schema (`prisma/schema.prisma`).
- **Authentication**: Auth.js v5, Credentials provider, JWT session strategy. Split into an edge-safe config (`src/lib/auth/edge-config.ts`, used by middleware) and a Node-only config (`src/auth.ts`, used everywhere else) because bcrypt and the Prisma client are not Edge-runtime compatible.
- **Storage**: Resumes are written to `./uploads` (outside `/public`, gitignored) and served only through an authenticated Route Handler (`/api/resumes/[id]`) that checks ownership or hiring-relationship access before streaming the file. Production requires swapping this for private object storage (S3-compatible bucket + signed URLs) — see `docs/architecture.md#not-implemented`.
- **Search**: Postgres `ILIKE`/relational filtering via Prisma (see `src/lib/data/jobs.ts`). Adequate for the current dataset size; a production deployment at scale should move to Postgres full-text search (`tsvector`) or a dedicated search service (e.g. Meilisearch) — see gaps below.
- **Notifications**: In-app only (`Notification` table, bell icon with unread count). No email delivery is wired up.
- **AI**: Not implemented. See `#not-implemented`.
- **Analytics**: Not implemented. Consent infrastructure exists (cookie banner, `ConsentRecord` audit table) so that when an analytics provider is added, it can be gated behind actual user consent from day one.

## 2. Feature map

| Module | Status | Notes |
|---|---|---|
| Job discovery & search | Built | Keyword, location, employment type, work mode, fresher-friendly, date-posted filters; sort by date/salary/relevance(=recency); pagination; filters persist via URL query params. |
| Transparent job matching | Built | Deterministic, explainable scoring (`src/lib/matching/job-match.ts`) — skills/experience/location/work-mode/education factors, each with a plain-language reason. No ML claim is made anywhere in copy. |
| Candidate profile | Built | Basic info, education, experience, skills, projects, certifications, languages, resumes (upload/primary/delete). |
| Resume storage | Built (dev-grade) | Local disk, access-controlled by a Route Handler. Needs object storage for production. |
| Career assessment | Built | 3-question assessment stored in DB, transparent rule-based scoring, results page with reasons, retake supported. |
| Career path pages + skill-gap analysis | Built | "You already have" / "You may need" comparison against the signed-in candidate's actual skills. |
| Personalized learning | Built | Learning paths → ordered modules; enroll, mark-complete, per-module and per-path progress tracking. |
| Employer job posting | Built | Draft/publish states, full field set (salary, experience, education, skills, application method). |
| ATS pipeline | Built | 8-stage pipeline, stage-change dropdown, internal notes, candidate match score shown to the employer, resume link. |
| Employer company profile | Built | Editable by company owner/admin. |
| Institution dashboard | Built (lighter) | Cohort + student roster with profile completeness and application counts, seeded with one demo institution. Cohort/member creation itself is not self-serve yet (see gaps). |
| Admin panel | Built (lighter) | Overview stats, user suspend/reactivate, job moderation (archive/restore), report review, audit log. |
| Notifications | Built | In-app bell + `/notifications` page. No email. |
| Legal & policy pages | Built | Privacy, terms, cookies, refund, accessibility, data request, about, contact — all real content, explicitly flagged where legal review is still required. |
| Resources/articles | Built | Category filtering, article detail pages with `Article` JSON-LD. |
| Cookie consent | Built | Accept/reject/customize, categories (necessary/preferences/analytics/marketing), consent logged to `ConsentRecord`. Nothing non-essential loads regardless of consent, because no analytics/marketing script is integrated yet. |
| Data export/delete requests | Built (request intake only) | `DataRequest` records are created; there is no automated fulfillment pipeline yet — see gaps. |
| Payments/subscriptions | Not implemented | `Subscription`/`Payment` tables exist as an architecture placeholder. No payment provider is wired in; nothing charges real money. |
| AI Career Assistant | Not implemented | No LLM API key is configured in this environment. See `#not-implemented`. |
| Email (transactional) | Not implemented | No email provider configured. |
| Candidate search for employers | Not implemented | Employers can see applicants to their own jobs; there's no standalone "browse all candidates" feature. |

## 3. Page map

```
/                                   Homepage
/jobs                               Job search
/jobs/[slug]                        Job detail + apply
/companies/[slug]                   Company profile
/career                             Career hub
/career/assessment                  Career assessment
/career/results                     Assessment results
/career/[slug]                      Career path detail + skill gap
/learn                              Learning hub
/learn/[slug]                       Learning path detail
/resources                          Resource hub
/resources/[slug]                   Article detail
/employers                          Employer marketing
/employers/services                 Talent services (consulting-style offerings)
/employers/sign-up                  Employer registration
/institutions                       Institution marketing
/sign-in, /sign-up                  Auth
/about, /contact                    Company pages
/accessibility, /data-request       Compliance-facing pages
/legal/privacy-policy, /terms,
  /cookie-policy, /refund-policy    Legal
/dashboard/*                        Candidate: overview, profile, applications, saved
/employer/*                         Employer: dashboard, jobs (+new/[id]/applicants), company
/institution/dashboard              Institution: cohorts and students
/admin/*                            Admin: overview, users, jobs, reports
/notifications                      Notifications
/sitemap.xml, /robots.txt,
  /manifest.webmanifest, /icon      SEO/PWA infrastructure
```

## 4. Database schema

See `prisma/schema.prisma` for the full source of truth (60+ models). Key entity groups:

- **Identity**: `User` (role enum: CANDIDATE/EMPLOYER/RECRUITER/INSTITUTION/EDUCATOR/ADMIN), `NotificationPreference`.
- **Candidate**: `CandidateProfile`, `Education`, `Experience`, `Project`, `Certification`, `CandidateLanguage`, `Resume`, `CandidateSkill`.
- **Employer**: `Company`, `EmployerMember` (role: OWNER/ADMIN/RECRUITER/MEMBER), `Job`, `JobSkill`.
- **Marketplace**: `SavedJob`, `JobAlert`, `Application`, `ApplicationNote`, `ApplicationStatusHistory`, `Interview`, `Message`.
- **Career & learning**: `Skill`, `CareerPath`, `CareerPathSkill`, `Assessment`/`AssessmentQuestion`/`AssessmentOption`/`AssessmentResult`, `LearningPath`, `LearningModule`, `UserLearningPath`, `ModuleProgress`.
- **Institution**: `Institution`, `InstitutionMember`, `Cohort`, `CohortStudent`.
- **Platform**: `Notification`, `Subscription`/`Payment` (placeholder), `ConsentRecord`, `DataRequest`, `AuditLog`, `Report`, `ContactMessage`, `Article`.

Design notes:
- IDs are `cuid()` strings throughout.
- Every model has `createdAt`; mutable models have `updatedAt`. `User`, `Company`, and `Job` have `deletedAt` for soft deletion; most child records use hard deletion via `onDelete: Cascade` since they have no independent lifecycle.
- Indexes are placed on foreign keys used in hot-path queries (`Job.status/publishedAt`, `Application.status`, `Notification.userId/isRead`, etc.) — see the schema for the full list.
- Unique constraints enforce real invariants: one application per (job, candidate), one saved-job per (candidate, job), one skill name globally, one primary resume flag toggled transactionally rather than constrained (SQLite/Postgres partial-unique-index alternative would be a future refinement).

## 5. Auth & RBAC model

- **Provider**: Auth.js v5 Credentials provider. Passwords hashed with bcrypt (cost factor 12).
- **Session**: JWT, 30-day max age, `httpOnly` cookie managed by Auth.js.
- **Roles**: CANDIDATE, EMPLOYER, RECRUITER, INSTITUTION, EDUCATOR, ADMIN. Role is embedded in the JWT/session and re-checked server-side on every protected read/write — the client-visible role is never trusted for authorization.
- **Two-layer enforcement**:
  1. **Middleware** (`src/middleware.ts`, Edge runtime) — coarse-grained redirect guard for `/dashboard/*`, `/employer/*`, `/institution/*`, `/admin/*`. Redirects unauthenticated users to sign-in and role-mismatched users to home.
  2. **Per-request checks** (`src/lib/auth/rbac.ts`, `src/lib/auth/employer.ts`, `src/lib/auth/institution.ts`) — every Server Component, Server Action, and Route Handler that touches non-public data calls `requireUser()`/`requireRole()`/`requireRoleOrRedirect()` and additionally scopes queries to the caller's own `companyId`/`institutionId`/`candidateProfileId`. Middleware alone is not treated as sufficient authorization anywhere in the codebase.
- **Ownership checks**: e.g. `updateJobAction` re-derives the caller's `companyId` from their `EmployerMember` row and filters the job lookup by it — a request for another company's job ID returns "not found," not the record.
- **Resume access**: `/api/resumes/[id]` checks: owner candidate, OR an employer whose company has an application referencing that resume, OR admin. Nobody else can fetch a resume by guessing its ID.

## 6. API surface

Server Actions (not REST, but the primary "API" of the app) are organized under `src/lib/actions/*`:
`auth.ts`, `profile.ts`, `applications.ts`, `employer-jobs.ts`, `employer-applications.ts`, `employer-company.ts`, `assessment.ts`, `learning.ts`, `admin.ts`, `contact.ts`, `data-request.ts`, `notifications.ts`.

Route Handlers (`src/app/api/*`) are used where REST/JSON or binary streaming fits better than a form action:
- `POST /api/auth/[...nextauth]` — Auth.js callback machinery.
- `POST /api/saved-jobs` — toggle a saved job (used by a client component that needs immediate optimistic feedback).
- `POST /api/resumes`, `GET/DELETE /api/resumes/[id]` — upload, authenticated download, delete.
- `POST /api/consent` — logs a `ConsentRecord` for cookie choices.

All mutating endpoints: validate input with `zod`, re-check auth/role/ownership server-side, and are rate-limited (see `src/lib/rate-limit.ts`) per IP+scope.

## Not implemented — by design, not by omission {#not-implemented}

These are called out explicitly rather than faked, per the project's build standard:

- **AI Career Assistant** — no LLM API key is configured in this build environment. The natural place to add it is a Server Action that calls the Anthropic API with the candidate's actual profile/job data as context, with generated text clearly labeled as AI-generated in the UI, distinct from verified platform data.
- **Payments** — no payment processor (e.g. Razorpay, Stripe) is integrated. `Subscription`/`Payment` models exist so the data model doesn't need to change when billing is added, but nothing charges money today.
- **Transactional email** — no provider (e.g. Postmark/SES) is wired up. Password reset, welcome email, and application-status email would need this.
- **Production file storage** — resumes live on local disk. Needs an S3-compatible bucket with signed URLs before real user documents should be stored.
- **Production-grade rate limiting** — the current limiter is in-memory per Node process; a multi-instance deployment needs a shared store (Redis/Upstash).
- **Search at scale** — current search is Postgres `ILIKE`. Fine for hundreds–low thousands of jobs; needs `tsvector` or a dedicated search service beyond that.
- **Candidate search for employers** ("browse all candidates") — not built; only applicant-to-your-jobs visibility exists.
- **Automated data export/delete fulfillment** — requests are recorded (`DataRequest`) but not yet auto-processed; would need a background job.

# Broken-link report & remaining work

## Broken-link audit

Method: enumerated every `page.tsx` route in `src/app` (38 distinct routes, several with dynamic segments), then requested each with `curl` against the running dev server — dynamic segments were tested with real seeded slugs (e.g. `/jobs/verdant-systems-frontend-engineer`, `/career/data-analyst`). Also grepped the codebase for `href="#"` and "coming soon"-style dead ends.

**Result: no broken links, no placeholder `#` hrefs, no "coming soon" dead ends.**

| Check | Result |
|---|---|
| All 38 page routes (public + real dynamic slugs) | 200 OK |
| All auth-gated routes, unauthenticated request | 307 redirect to `/sign-in` (correct — this is middleware working, not a broken page) |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/icon`, `/apple-icon` | 200 OK |
| Unknown route (`/not-a-real-page`) | 404, served by the custom `not-found.tsx`, not a framework default |
| `grep href="#"` across `src/` | 0 matches |
| `grep "coming soon"` / `TODO` across `src/` | 0 matches |
| Production build (`npm run build`) | Succeeds — all 46 generated routes (including API routes) compile and type-check |

Not covered by this pass: a full crawl clicking every in-page link from every page (would require a headless browser crawler); the route-level sweep above is a strong proxy since footer/nav (present on every page) were exercised repeatedly across many manual browser sessions during development without a single dead link encountered.

## Remaining implementation tasks

Ordered roughly by what a next milestone should tackle first:

1. **Object storage for resumes** — replace local-disk storage before any real user uploads a real document (see `docs/architecture.md#not-implemented`).
2. **Children's-data compliance** (DPDP) — age verification + guardian consent before onboarding known-minor users.
3. **Screen-reader accessibility pass** — a real walkthrough with VoiceOver/NVDA, particularly the employer job-posting form and ATS status controls.
4. **Automated data export/delete fulfillment** — `DataRequest` rows are created but not yet processed by a background job.
5. **Security headers** — HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy in `next.config.ts`.
6. **Candidate search for employers** — currently employers only see applicants to their own jobs; a "search all candidates" feature was scoped out of this build.
7. **Institution self-serve onboarding** — cohorts/institution accounts are currently seeded by hand; there's no self-serve "create an institution account" flow parallel to the candidate/employer ones.
8. **Email notifications** — everything today is in-app only; no transactional email provider is integrated.
9. **AI Career Assistant** — not built; needs an LLM provider and a design that grounds every response in the user's real profile/platform data, with generated content visibly distinguished from verified data.
10. **Payments** — no processor integrated; `Subscription`/`Payment` tables are schema-only.
11. **Bundle-size measurement** — no bundle analyzer has been run yet (see `docs/audits.md#performance`).
12. **Search at scale** — move beyond `ILIKE` filtering (Postgres `tsvector` or a dedicated search service) once the job catalog grows well beyond what this build was seeded with.

~~Projects, certifications, languages UI~~ — done: the candidate profile page now has full CRUD for projects, certifications, and languages, verified working end-to-end in-browser (add + remove).

## What's genuinely working end-to-end today

Verified by hand in a running browser session against real Postgres data (not asserted from code alone):

- Candidate sign-up/sign-in, profile editing (basic info, education, experience, skills, resume upload/download/delete/set-primary).
- Job search with persisted URL filters, sorting, pagination; job detail with transparent match-score breakdown; save/unsave; Easy Apply.
- Career assessment → results → career-path detail with a real skill-gap comparison against the signed-in candidate's actual skills.
- Learning path enrollment and per-module progress tracking, reflected immediately in the candidate dashboard.
- Employer sign-up, job posting (draft/publish), applicant pipeline with stage changes, internal notes, and per-applicant match scores.
- Institution dashboard showing real cohort/student data (profile completeness, application counts).
- Admin panel: user suspend/reactivate (which actually blocks sign-in), job moderation, report review, audit log.
- Notifications generated on real events (new applicant, application status change) and shown with an unread badge.
- Cookie consent banner gating a `ConsentRecord` audit trail.
- Contact form and data-request intake writing real rows to Postgres.

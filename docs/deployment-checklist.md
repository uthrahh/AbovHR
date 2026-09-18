# Production deployment checklist

## Live deployment

Deployed to Vercel at **https://abovhr.vercel.app**, backed by a Neon Postgres database (Vercel Marketplace integration), seeded with the same fictional demo data described in the README. This is a demo/portfolio-quality deployment, not a production launch with real users — treat the data and accounts accordingly (shared demo password, no real payment/email integration, etc.).

### Incident: Prisma query engine not found on some routes (resolved)

The first deploy attempt failed at runtime with `PrismaClientInitializationError: could not locate the Query Engine for runtime "rhel-openssl-3.0.x"` — but only on some routes (the homepage), not others (`/jobs`, `/sitemap.xml`). Root cause: the newer `prisma-client` generator with a custom output path (`src/generated/prisma`) hit a per-route file-tracing gap under Next.js 16 + Turbopack on Vercel — some routes' serverless bundles included the native query engine binary, others didn't, for reasons that weren't fully diagnosable from the outside. Fix: switched to the classic, far more battle-tested `prisma-client-js` generator (default `node_modules/.prisma/client` output), which Next's tracer bundles reliably, and added `binaryTargets = ["native", "rhel-openssl-3.0.x"]` so both local dev (Windows/macOS/Linux) and Vercel's Linux function runtime get the engine they each need. Also added a project-level `postinstall: "prisma generate"` script — Prisma's own nested postinstall hook can be skipped by npm when Vercel reuses a cached `node_modules`, silently leaving a stale generated client; a top-level postinstall always reruns.

## Before first deploy

- [x] Push this repository to a Git host — already connected (`github.com/uthrahh/AbovHR`, auto-synced by environment tooling).
- [x] Provision a managed PostgreSQL instance — Neon, via Vercel's Marketplace integration.
- [x] Generate a fresh `AUTH_SECRET` for production, distinct from the local dev one — set via `vercel env add`.
- [x] `APP_URL` — not set explicitly; `src/lib/site-url.ts` auto-detects Vercel's own assigned domain via `VERCEL_PROJECT_PRODUCTION_URL`, so this wasn't needed. Set `APP_URL` explicitly only if you attach a custom domain and want metadata to reference that instead.
- [x] Ran `prisma migrate deploy` against the production database.
- [x] Seeded demo/fixture data — appropriate here since this is a demo deployment, not a real launch. **Do not do this for an actual production launch with real users** — see the live-deployment note above.

## Known gaps to close before real users touch it

| Gap | Why it matters | What to do |
|---|---|---|
| Local-disk resume storage | Breaks on serverless (ephemeral filesystem); resumes are PII and deserve access-controlled storage | Swap `src/lib/storage.ts` for an S3-compatible bucket + signed URLs |
| In-memory rate limiting | Doesn't coordinate across multiple server instances | Move `src/lib/rate-limit.ts` to a shared store (Redis/Upstash) once running more than one instance |
| No payment processor | Billing UI exists but nothing charges money | Integrate a real provider (e.g. Razorpay for India) before enabling paid plans, and update `/legal/refund-policy` to match its actual terms |
| No transactional email | No password reset, welcome, or status-change email | Integrate a provider (Postmark/SES/etc.) |
| No AI assistant | Career assistant described in the product spec isn't built | Requires an Anthropic API key and a Server Action that grounds responses in the candidate's actual profile/job data, clearly labeled as AI-generated |
| Children's data / DPDP minors provision | Some candidates/students may be under 18 | Implement age verification + verifiable guardian consent before onboarding known-minor users — see `docs/legal-and-ip.md` |
| Grievance officer designation | Required under DPDP Act for a real deployment | Name a real person/contact and update `/legal/privacy-policy` |

## Standard production hygiene

- [ ] Enable HTTPS (automatic on Vercel; otherwise terminate TLS at your load balancer/proxy).
- [ ] Set `NODE_ENV=production`.
- [x] Security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options) are set in `next.config.ts` for every response.
- [ ] Point error logging somewhere real (Sentry or similar) — `src/app/error.tsx` currently only `console.error`s.
- [ ] Confirm `robots.txt`/`sitemap.xml` resolve against the real domain (they already read `APP_URL`).
- [ ] Rotate the admin demo account password or replace the seeded admin with a real one — do not ship `admin@abov.demo` / the shared demo password to production.
- [ ] Run `npm run build` locally or in CI before every deploy — it typechecks the whole project and will catch what dev mode's incremental compiler can miss (this caught real type errors during this build; see git history).

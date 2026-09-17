# Production deployment checklist

## Before first deploy

- [ ] Push this repository to a Git host (GitHub/GitLab).
- [ ] Provision a managed PostgreSQL instance (Neon, Supabase, Railway, RDS, etc.) — do not point production at the local dev database used in this build.
- [ ] Generate a fresh `AUTH_SECRET` for production (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) — never reuse the dev value committed nowhere but also never reused.
- [ ] Set `APP_URL` to the real production domain (used for metadata, sitemap, OG tags).
- [ ] Run `DATABASE_URL="<prod>" npx prisma migrate deploy` against the production database.
- [ ] Decide whether to run the seed script in production. It's dev/demo fixture data (fictional companies, jobs, and accounts with a shared password) — **do not seed a real production database with it.**

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

# Abov

A career platform for finding jobs and internships, planning your next role, closing skill gaps, and connecting candidates with employers and institutions — built by **Abov HR**.

**Live demo:** https://abovhr.vercel.app (seeded with fictional demo data — see accounts below)

## Key features

- **Job discovery & transparent matching** — keyword/location/filter search plus a deterministic, explainable match score (no black-box "AI" claims).
- **Structured candidate profile** — basic info, education (10th/12th/undergraduate required, additional levels optional), work experience, skills, projects, certifications, languages, links, volunteering, publications, and awards. Field-level validation throughout, with a rule-based "generate summary" draft built from the candidate's own data.
- **Resume-free ATS applications** — applying shares only the profile sections a job actually requests; a candidate can check an ATS keyword-match score against any listing before applying, computed from their structured profile, not an uploaded file.
- **Quick-fill import** — pre-fill profile fields from a pasted/PDF resume or an official LinkedIn data export (CSV); imported data only fills empty fields and stays fully editable before saving.
- **Employer ATS pipeline** — job posting, an 8-stage applicant pipeline, internal notes, and per-candidate match scores.
- **Career tools** — a short career assessment, career-path pages with skill-gap analysis, and structured learning paths with progress tracking.
- **Institution dashboard**, **admin panel**, and **installable PWA app shell** (the deployed app renders as a native-feeling app when added to a phone's home screen, distinct from the marketing site).

Full product/engineering documentation lives in [`docs/`](docs/):

- [`docs/architecture.md`](docs/architecture.md) — system architecture, feature map, page map, database schema, auth/RBAC model, API surface, and what's explicitly *not* implemented yet.
- [`docs/privacy-and-data.md`](docs/privacy-and-data.md) — data flow, third-party dependency inventory, cookie inventory.
- [`docs/audits.md`](docs/audits.md) — accessibility, SEO, performance, and security self-review.
- [`docs/legal-and-ip.md`](docs/legal-and-ip.md) — legal/compliance risk register and IP/asset register.
- [`docs/project-status.md`](docs/project-status.md) — broken-link report and remaining implementation tasks.
- [`docs/deployment-checklist.md`](docs/deployment-checklist.md) — how to actually ship this.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · PostgreSQL + Prisma · Auth.js v5 (Credentials, JWT sessions).

## Local development

Prerequisites: Node 20+, a local PostgreSQL instance.

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and AUTH_SECRET
npx prisma migrate dev
npm run db:seed        # optional — loads fictional demo data
npm run dev
```

Open http://localhost:3000 (or whatever port the CLI reports if 3000 is taken).

### Demo accounts (only if you ran `npm run db:seed`)

All use password `DemoPass123!`:

| Email | Role |
|---|---|
| `admin@abov.demo` | Admin |
| `educator@bellwood.demo` | Institution admin |
| `hiring@verdantsystems.demo` | Employer |
| `hiring@northbridgeanalytics.demo` | Employer |
| `arjun.rao@abov.demo` | Candidate |
| `sneha.iyer@abov.demo` | Candidate |

This is fictional seed data for local development — see `prisma/seed/index.ts`. Never run the seed script against a production database.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (full type-check) |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Load demo fixture data |
| `npm run db:studio` | Prisma Studio (browse the database) |

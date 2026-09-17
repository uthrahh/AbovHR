# Quality audits — accessibility, SEO, performance, security

Self-review performed against the running build in this repository. Each section marks items as **Done**, **Partial**, or **Gap** rather than claiming blanket compliance.

## Accessibility (target: WCAG 2.2 AA)

| Area | Status | Notes |
|---|---|---|
| Landmarks & heading structure | Done | `header`/`nav`/`main`/`footer` on every page; each page has exactly one `h1`. |
| Skip link | Done | "Skip to main content" is the first focusable element, visually hidden until focused. |
| Keyboard operability | Done | All interactive controls are native `button`/`a`/`input`/`select`/`dialog` elements — no custom click-only `div`s. Verified the mobile nav, filter dialog, and cookie preferences dialog trap focus and close on Escape via the native `<dialog>` element rather than hand-rolled JS. |
| Focus visibility | Done | A single global `:focus-visible` style (2px outline, `--color-focus`, offset) applies everywhere — never removed, never color-only. |
| Form labels & errors | Done | Every input has a programmatically associated `<label>` via `useId()`; errors use `role="alert"` and `aria-describedby`; required/optional is stated in the label, not implied by color. |
| Color contrast | Done | Text/background pairs were deliberately computed against WCAG formulas rather than using the raw brand hex for text (see `src/app/globals.css` comment) — e.g. link/button text uses `--color-accent-text` (#A64400, ~6.1:1 on white) rather than the decorative brand orange (#CC5500, ~4.3:1, reserved for large elements/icons only). |
| Reduced motion | Done | `prefers-reduced-motion: reduce` collapses all transition/animation durations globally. |
| Touch targets | Partial | Buttons/links use adequate padding; not every icon-only button has been measured against the 24×24 CSS px minimum on every viewport — worth a dedicated pass. |
| Data tables | Done | Admin users/cookie-policy tables use `<caption>`, `<th scope>`. |
| Screen-reader walkthrough | **Gap** | Not performed with an actual screen reader (VoiceOver/NVDA) end-to-end, particularly the multi-step employer job form and ATS status `<select>`. Flagged as the top remaining accessibility task. |
| Image alt text | Done | The app uses no photographic imagery; decorative SVG icons carry `aria-hidden="true"` via the shared icon components. |

## SEO

| Area | Status | Notes |
|---|---|---|
| Per-page metadata | Done | Every route exports/generates a unique `title` and `description`; `layout.tsx` sets a title template (`%s | Abov`). |
| Canonical/OG/Twitter | Partial | `openGraph`/`twitter` set at the root layout with sensible defaults; per-page OG overrides exist for jobs/articles but not yet for every route (career paths, company pages inherit root defaults rather than custom OG text). |
| Structured data | Done | `JobPosting` on job detail pages, `Organization` on company pages, `Article` on resource pages — all populated from real fields, nothing fabricated (e.g. no fake `aggregateRating`). `BreadcrumbList` and `Course` are not yet implemented. |
| Sitemap | Done | `/sitemap.xml` is dynamic — includes every published job, company, and career path, not just static routes. |
| Robots | Done | `/robots.txt` disallows authenticated-only prefixes (`/dashboard`, `/employer/`, `/institution/`, `/admin`, `/api/`) and references the sitemap. Not linked from any visible nav, per spec. |
| Semantic HTML | Done | Headings are hierarchical; job/article content uses `<article>`/`<section>` appropriately. |
| Custom 404 | Done | `not-found.tsx` includes a search box and links to jobs/home, not a framework default. |

**Gaps**: `BreadcrumbList` structured data on category/detail pages; per-page custom OG images (currently text-only OG tags, no generated image via `next/og`).

## Performance

| Area | Status | Notes |
|---|---|---|
| Server Components by default | Done | Client Components are used only where interaction requires them (forms, filters, dialogs) — verified by grep: `"use client"` appears in ~25 files out of 150+ components/pages. |
| Fonts | Done | `next/font/google` self-hosts Newsreader + IBM Plex Sans at build time — zero runtime requests to Google Fonts, no render-blocking external font CSS. |
| Images | N/A | No photographic images are used anywhere in the product (by design — see the visual system notes in `docs/architecture.md`); the only generated images are the favicon/apple-icon via `next/og`, which are tiny SVG-based PNGs. |
| Dependencies | Done | Deliberately minimal: no icon library (hand-authored SVGs instead), no animation library, no form library (native forms + Server Actions + zod), no state-management library. `npm ls --depth=0` shows a short, intentional dependency list. |
| Database query shape | Partial | Dashboard and matching queries fetch related rows via Prisma `include` rather than N+1 loops; the homepage and job-recommendation queries pull a bounded `take: 30` candidate set for match scoring rather than scanning the whole `Job` table, which is fine at current scale but would need a real ranking/index strategy (e.g. precomputed match scores, or `tsvector` search) well before tens of thousands of jobs. |
| Loading states | Partial | Skeleton `loading.tsx` files cover `/jobs`, `/jobs/[slug]`, `/dashboard`, `/career/[slug]`, and `/learn/[slug]`. Employer/admin/institution dashboards still rely on Next's default streaming behavior rather than a dedicated skeleton — lower priority since those are internal, lower-traffic surfaces. |
| Production build | Done | `npm run build` completes cleanly (see build log) — full type-check passes, all 46 routes compile. |
| Bundle-size measurement | **Gap** | Turbopack's production build output in this Next.js version doesn't print a per-route First Load JS table the way the webpack builder does; a dedicated bundle-analysis pass (`@next/bundle-analyzer` or Turbopack's equivalent once available) hasn't been run. Qualitatively low-risk given the minimal-dependency approach above, but not independently measured. |

**Known non-blocking warning**: `src/lib/storage.ts` triggers a Turbopack "dynamic filesystem access" trace warning because the upload path is built from `process.env.UPLOAD_DIR`. It doesn't fail the build, but on a serverless target it would bundle more of the project into the function than necessary. Moot once local-disk storage is replaced with object storage (see `docs/architecture.md`).

## Security

| Area | Status | Notes |
|---|---|---|
| Password storage | Done | bcrypt, cost factor 12. Password policy favors length (10+ chars) over forced complexity, plus a common-password blocklist, per NIST 800-63B guidance — documented inline in `src/lib/validation/auth.ts`. |
| Session security | Done | Auth.js JWT session, `httpOnly` cookie, 30-day max age. |
| Authorization | Done | Every Server Action/Route Handler re-checks role and ownership server-side (see `docs/architecture.md#5-auth--rbac-model`) — never trusts the client-visible session role alone. Verified by reading every file under `src/lib/actions/` and `src/app/api/`. |
| Input validation | Done | `zod` schemas validate every mutating action's input; Prisma parameterizes all queries (no raw SQL string concatenation anywhere in the codebase). |
| CSRF | Done | Next.js Server Actions include built-in origin verification (Next.js rejects a Server Action POST whose `Origin` header doesn't match the deployment's host). Route Handlers that mutate state are same-origin `fetch` calls from the app's own client code. |
| XSS | Done | React escapes all interpolated content by default. The two intentional `dangerouslySetInnerHTML` uses (`src/app/jobs/[slug]/page.tsx`, `src/app/companies/[slug]/page.tsx`) only inject `JSON.stringify()` output of server-controlled JSON-LD objects — never raw user input. |
| File upload safety | Done | Resume uploads are restricted by MIME type allow-list and a size cap (`MAX_UPLOAD_BYTES`), stored under a random filename outside `/public`, and served only through an authorization-checked Route Handler. |
| Rate limiting | Partial | Applied to sign-in, registration, contact form, resume upload, saved-job toggle, and consent logging. In-memory only — see the deployment checklist for the multi-instance gap. |
| Secrets management | Done | `.env` is gitignored; `.env.example` documents required variables without real values; `AUTH_SECRET` is generated locally, never hardcoded in source. |
| Security headers | Done | `next.config.ts` sets `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options` on every response. |
| Audit logging | Done | Sensitive admin actions (user suspension, job moderation, report resolution) write an `AuditLog` row with actor, action, target, and timestamp. |
| Dependency vulnerabilities | Partial | `npm audit` reports 3 high-severity advisories, all in `deepmerge-ts` (a transitive dependency of Prisma's CLI config loader, `@prisma/config`) — this affects the `prisma` CLI tool at dev/build time, not the `@prisma/client` runtime code that ships in the deployed app, and exploiting it would require an attacker controlling Prisma config input, which isn't user-reachable. Tracked, not yet resolvable without a Prisma downgrade that reintroduces other issues; re-check on the next Prisma patch release. |

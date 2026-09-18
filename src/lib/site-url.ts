/**
 * Resolves the canonical site URL for metadata, sitemap, and OG tags.
 * Prefers an explicit APP_URL, falls back to Vercel's own injected
 * production URL so this doesn't need to be hardcoded per-deployment.
 */
export function getSiteUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

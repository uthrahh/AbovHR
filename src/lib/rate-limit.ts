/**
 * In-memory fixed-window rate limiter.
 *
 * Works for a single Node process. It does NOT coordinate across multiple
 * server instances — a production multi-instance deployment needs a shared
 * store (e.g. Redis/Upstash) behind this same interface. Flagged in
 * docs/architecture/security.md.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

// Prevent unbounded growth from spoofed/rotating keys.
const MAX_TRACKED_KEYS = 50_000;

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

export function clientKeyFromRequest(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  return `${scope}:${ip}`;
}

/**
 * In-memory sliding-window rate limiter (per IP + bucket).
 * Suitable for single-instance deployments; swap for Redis/Upstash at scale.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodic cleanup to avoid unbounded growth
const CLEAN_EVERY = 5 * 60 * 1000;
let lastClean = Date.now();

function cleanup(now: number) {
  if (now - lastClean < CLEAN_EVERY) return;
  lastClean = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  cleanup(now);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterSec: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

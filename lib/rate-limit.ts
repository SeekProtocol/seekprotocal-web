interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const CLEANUP_INTERVAL_MS = 300_000;

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * In-memory per-instance rate limiter. Provides basic protection in
 * serverless environments; for production-grade limits consider Upstash Redis.
 */
export function rateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
} {
  cleanup();

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count++;
  const allowed = entry.count <= MAX_REQUESTS;
  return { allowed, remaining: Math.max(0, MAX_REQUESTS - entry.count) };
}

/**
 * Sliding-window in-memory rate limiter.
 * Effective on warm Vercel instances; resets on cold starts (acceptable trade-off for zero deps).
 */
const hits = new Map<string, number[]>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_HITS = 5;       // 5 requests per window per IP
const CLEANUP_INTERVAL = 60_000;

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - WINDOW_MS;
  for (const [key, timestamps] of hits) {
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) hits.delete(key);
    else hits.set(key, filtered);
  }
}

export function isRateLimited(ip: string): boolean {
  cleanup();
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const timestamps = (hits.get(ip) || []).filter((t) => t > cutoff);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > MAX_HITS;
}

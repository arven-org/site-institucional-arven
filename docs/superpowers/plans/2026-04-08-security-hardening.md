# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the high/medium security vulnerabilities found in the audit: CORS wildcard, missing rate limiting, missing CSP/HSTS headers, and payload pre-check.

**Architecture:** All fixes are small, surgical changes to existing files. Rate limiting uses an in-memory sliding window in the API route (imperfect across cold starts but effective for warm Vercel instances and zero new dependencies). CORS is locked to the production origin. Security headers are added to `vercel.json`.

**Tech Stack:** Astro 6, Vercel serverless, TypeScript

---

### Task 1: Lock CORS to production origin

**Files:**
- Modify: `src/pages/api/lead.ts:86-95` (OPTIONS handler) and add CORS header to POST response

- [ ] **Step 1: Update the ALLOWED_ORIGIN constant and OPTIONS handler**

In `src/pages/api/lead.ts`, add an origin constant at the top (after the `REQUIRED` array) and update the `OPTIONS` handler:

```ts
const ALLOWED_ORIGIN = "https://arven.com.br";
```

Replace the OPTIONS handler:

```ts
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

- [ ] **Step 2: Add CORS header to the jsonResponse helper**

Replace the `jsonResponse` function so every POST response includes the CORS origin:

```ts
function jsonResponse(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    },
  });
}
```

- [ ] **Step 3: Verify locally**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/lead.ts
git commit -m "fix(security): restrict CORS to production origin on lead API"
```

---

### Task 2: Add in-memory rate limiting to lead API

**Files:**
- Create: `src/lib/rate-limit.ts`
- Modify: `src/pages/api/lead.ts` (import + early guard in POST)

- [ ] **Step 1: Create the rate limiter module**

Create `src/lib/rate-limit.ts`:

```ts
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
```

- [ ] **Step 2: Wire rate limiter into the POST handler**

In `src/pages/api/lead.ts`, add the import at the top (after existing imports):

```ts
import { isRateLimited } from '../../lib/rate-limit';
```

Add this as the **first check** inside the `POST` function body, before the `target` check:

```ts
const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
if (isRateLimited(clientIp)) {
  return jsonResponse(429, { error: "too_many_requests" });
}
```

- [ ] **Step 3: Verify locally**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/rate-limit.ts src/pages/api/lead.ts
git commit -m "fix(security): add in-memory rate limiting to lead API (5 req/min per IP)"
```

---

### Task 3: Pre-check Content-Length before reading body

**Files:**
- Modify: `src/pages/api/lead.ts` (inside POST handler, before `request.text()`)

- [ ] **Step 1: Add Content-Length fast-reject**

In `src/pages/api/lead.ts`, inside the POST handler, **after** the rate limit check and **before** the `let body: any` block, add:

```ts
const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
if (contentLength > 256 * 1024) {
  return jsonResponse(413, { error: "payload_too_large" });
}
```

Keep the existing `text.length` check as a fallback (Content-Length can be spoofed).

- [ ] **Step 2: Verify locally**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/lead.ts
git commit -m "fix(security): pre-check Content-Length before reading request body"
```

---

### Task 4: Add CSP and HSTS headers

**Files:**
- Modify: `vercel.json` (add two headers to the `"/(.*)"` block)

- [ ] **Step 1: Add the headers**

In `vercel.json`, in the `"source": "/(.*)"` headers array, add these two entries:

```json
{
  "key": "Strict-Transport-Security",
  "value": "max-age=63072000; includeSubDomains; preload"
},
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' https://cdn.sanity.io data:; connect-src 'self' https://*.sanity.io https://webhook.trafegoedu.com.br; frame-src 'none'; object-src 'none'; base-uri 'self'"
}
```

Note: `'unsafe-inline'` is needed for script because Astro injects inline scripts, and for style because of inline styles in components. This can be tightened later with nonces.

- [ ] **Step 2: Verify locally**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "fix(security): add HSTS and Content-Security-Policy headers"
```

---

### Task 5: Verify full build and smoke test

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Build completes with no errors or warnings related to changes.

- [ ] **Step 2: Review all changed files**

Run: `git diff HEAD~4` to verify all four commits look correct.

- [ ] **Step 3: Preview test (if possible)**

Run: `npm run preview` and manually test:
- Load the home page — check no CSP console errors
- Submit the lead form — verify it still works
- Check response headers in devtools for CSP/HSTS

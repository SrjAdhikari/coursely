---
status: approved
version: 1.1
date: 2026-06-23
---

# 06 — Security / Threat Model

L-depth, the heaviest-weighted criterion. Structured by **STRIDE** (Spoofing, Tampering,
Repudiation, Information disclosure, Denial of service, Elevation of privilege) walked
against the trust boundaries below. Each threat names a concrete attack on *this* system
and the mitigation built for it. Most mitigations were designed into docs 03–05; this doc
collects them and exposes residual risk.

## 1. Trust Boundaries

Data flow (from `03`) crosses four boundaries where trust changes:

- **B1 Browser → API** — all client input is untrusted; validated/authorized server-side.
- **B2 Browser → R2** — direct video transfer via presigned URLs (no API in the path).
- **B3 Stripe → API webhook** — inbound money events; authenticity by signature, not session.
- **B4 API → Atlas** — scoped DB credentials; network-restricted.

Card data never crosses our boundaries — it lives entirely inside Stripe Checkout.

## 2. STRIDE

### S — Spoofing (authentication)
- *Impersonating a user / forging a session.* → Opaque server-side session IDs stored in
  Mongo (not guessable, not JWT-decodable); cookie is `httpOnly` (JS can't read it, so XSS
  can't steal it) + `Secure` (HTTPS only). Passwords bcrypt-hashed (FR-6). **Session is
  regenerated on login** to prevent session fixation. Logout and admin-deactivate
  (`isActive=false`) invalidate the session server-side immediately.
- *Credential stuffing / brute force on login.* → Per-IP rate limiting on auth routes (NFR-6).
- *Forged payment event* — attacker POSTs a fake `checkout.session.completed` to grant
  themselves enrollment. → **Stripe signature verification** against the webhook secret;
  unsigned/invalid events are rejected before any DB write (FR-11, NFR-2). This is the
  single most important integrity control.

### T — Tampering (integrity)
- *Client tampers with price or pays less.* → Price is read from the **course record**
  server-side at checkout, never from the client; the webhook re-validates
  `amount_total`/`currency` against the course before creating enrollment (NFR-2).
- *Client forges enrollment* (skips payment). → Enrollment is written **only** by the
  signature-verified webhook; the client success page only *reads* state (FR-11).
- *Client elevates its own role / sets fields it shouldn't* (mass assignment). → Schema
  validation strips unknown fields; `role` is forced to `student` on signup and can only
  change via the admin route; never trusted from a request body (NFR-1, NFR-4).
- *Tampering in transit.* → TLS on every hop (Vercel, Render, R2, Stripe).
- *NoSQL (operator) injection* — an attacker smuggles a query operator into a field,
  e.g. POSTing `{"email": {"$ne": null}}` to a login body to match any user. → Schema
  validation rejects unexpected types (a field typed `string` rejects an object);
  Mongoose typed schemas cast input; `express-mongo-sanitize` strips keys containing `$`
  or `.` from request payloads so operators never reach the query. There is no string-built
  query / SQL, so classic SQL injection does not apply (NFR-4).

### R — Repudiation (non-repudiation)
- *User denies a purchase.* → Each enrollment stores `stripeSessionId`, `amountPaid`,
  `currency`, and timestamp (`04`), cross-referable to Stripe's own immutable record.
- *Dispute over account actions.* → Auth events and admin mutations are logged
  server-side (no PII/secrets in logs). Full audit logging is out of scope for v1 but the
  payment trail — the one that matters for money — is retained.

### I — Information Disclosure (confidentiality)
- *Paid video via a public or guessable URL.* → R2 bucket is **private** (no public
  access); video is served only via a **per-request presigned GET, ~1 h TTL**, minted
  after the enrollment check; `videoKey` is **never** returned in any API response;
  preview lessons are the sole exception (NFR-3, FR-17). This is the content-protection core.
- *Secrets leaking* (Stripe/R2 keys, session secret, DB URI). → Env-only config on
  Render/Vercel; `.env` git-ignored; never in the client bundle; R2 keys scoped to the
  bucket; Stripe keys are test-mode (NFR-5).
- *User enumeration* via auth responses. → Login/signup return **generic** failure
  messages that don't reveal whether an email exists.
- *Internal detail in errors.* → Consistent `{ error: { code, message } }` shape; stack
  traces and secret-bearing text never reach the client.
- *PII/passwords in logs.* → Passwords never logged; bcrypt only; request logging excludes
  bodies on auth routes.

### D — Denial of Service (availability)
- *Flooding auth endpoints.* → Rate limiting (NFR-6).
- *Large uploads exhausting the API.* → Video bytes go **direct to R2** via presigned PUT;
  the API never buffers the heaviest payload (AD-4), so the obvious resource-exhaustion
  vector bypasses the server entirely.
- *Oversized request bodies.* → Express body-parser `limit` rejects large JSON payloads
  (the legit large payload — video — never hits the API; it goes direct to R2).
- *Expensive queries.* → All hot paths are indexed (`04`).
- *Volumetric / L7 flooding.* → **Cloudflare** fronts the bandwidth-heavy R2 path and can
  front the API domain, providing network-layer DDoS absorption ahead of the single
  origin.
- *Security headers.* → `helmet` sets standard headers (HSTS, no-sniff, frame options,
  CSP — see §3) (NFR-6).
- *Residual:* single Render instance, no WAF/HA in v1 — accepted at demo scale (`09` risks
  in `03`).

### E — Elevation of Privilege / Broken Access Control (authorization · OWASP A01)
- *Student reaches admin routes.* → `requireAdmin` middleware on every management route;
  role checked server-side from the session, `403` on failure (FR-9, NFR-1). The RBAC
  matrix in `05 §4` is the audit of this.
- *IDOR — reading another user's data* (progress, enrollments, dashboard). → Every
  per-user query is scoped to `req.user._id` **from the session**, never a client-supplied
  `userId`. No "fetch my data" endpoint accepts a user identifier from the client.
- *Watching a paid lesson without enrolling.* → `playback-url` mints a signed GET only
  after confirming `isPreview` or an enrollment row for `{session user, lesson.courseId}`;
  otherwise `403` (FR-17).

## 3. Cross-Cutting Controls

- **CSRF:** `SameSite=Lax` session cookie is the primary defense (blocks the cross-site
  request shapes that drive CSRF). **Defense-in-depth:** mutating routes additionally
  reject requests whose `Origin`/`Referer` is not the known frontend. Two layers, no token
  plumbing.
- **CORS:** locked to the single frontend origin with `credentials: true`; no wildcard.
- **XSS:** React escapes output by default and `dangerouslySetInnerHTML` is avoided
  (reflected XSS). **Stored XSS** — admin-entered course/lesson text is rendered to
  students, so it is sanitized on input (strip/encode HTML) before storage. The
  `httpOnly` session cookie means even a successful XSS cannot read the session, and CSP
  (below) is the backstop.
- **Content Security Policy:** explicit `helmet.contentSecurityPolicy` policy —
  `default-src 'self'`; `script-src 'self'`; `style-src 'self'`; `img-src 'self'` + the
  R2/Cloudflare media host; `media-src 'self'` + the R2/Cloudflare host (so signed-URL
  video plays); `connect-src 'self'` + the API origin; `frame-ancestors 'none'`
  (clickjacking); `object-src 'none'`. Tuned to allow our own media hosts and nothing else.
- **Input validation:** schema validation at every route boundary; reject-on-failure (NFR-4).
- **Transport:** HTTPS everywhere; `Secure` cookies; HSTS via helmet.

### OWASP mapping (quick reference for the call)

| Concern | Where handled |
|---|---|
| Broken Access Control (A01) | §2-E (RBAC, IDOR, playback gating) |
| Injection — NoSQL (A03) | §2-T (validation, mongo-sanitize); no SQL used |
| XSS (A03) | §3 XSS + CSP |
| CSRF | §3 (Lax + Origin/Referer) |
| DDoS / availability | §2-D (rate limit, body limits, Cloudflare, direct-to-R2) |
| Security headers / CSP | §3 (helmet + explicit CSP) |

## 4. Residual Risks (accepted for v1)

- No HA / WAF / multi-region — single Render instance; acceptable at demo scale.
- No 2FA / MFA — out of scope for v1; password + rate limiting only.
- Bot protection limited to rate limiting (no CAPTCHA).
- Audit logging is payment-focused, not exhaustive.

Each is a conscious scope decision (`01`), not an oversight — revisit if the platform
moves beyond demo scale.

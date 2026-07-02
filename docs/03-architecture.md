---
status: approved
version: 1.1
date: 2026-06-23
---

# 03 — Architecture

Anchored to arc42 (lightweight). This doc captures and justifies the stack.

## 1. Goals & Constraints

Deliver the requirements in `02` within: a lean timeline, a small team, ≤ ~₹600/month, and every layer
explainable. These constraints push consistently toward **managed services over
self-managed infra** and **zero-egress video**.

## 2. System Context

Actors and external systems the platform talks to:

- **Student / Admin (browser)** — the only human actors.
- **Stripe** — hosted Checkout + webhooks; handles card data (we never see it).
- **Cloudflare R2** — object storage for video; receives direct browser uploads and
  serves video via signed URLs.
- **MongoDB Atlas** — application database.

```
Browser ──HTTPS──> Static host (SPA)
Browser ──HTTPS/fetch(credentials)──> API host (Express) ──> Atlas (Mongo)
Browser ──presigned PUT/GET──> Cloudflare R2  (video bytes never touch the API)
Stripe ──webhook──> API host (Express)
Browser ──redirect──> Stripe Checkout ──redirect──> Static host
```

## 3. Solution Strategy (the stack & why)

| Concern        | Decision                                                                                                              | Why this, not the alternative                                                                                                                                                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend       | React 19 + Vite + **TypeScript** · Tailwind + **shadcn/ui** · **TanStack Query** + axios, hosted on a **static/CDN host** (free) | CDN-served SPA, zero cost; no SSR need for a small catalog.                                                                                                                                                                                                                                           |
| API            | **Express 5 + TypeScript** on a **managed host** (~$7/mo, always-on); **zod** validation                                             | Stateless API moves no video → a managed platform is cost-optimal and removes server hardening burden. A self-managed VM was rejected: nothing heavy runs on the box, so it adds ops cost + security surface for no benefit. A free, sleeping tier was rejected: cold-start sleep ruins the live demo.                                |
| Database       | **MongoDB Atlas M0** (free)                                                                                           | Natural for MERN; document model fits course→section→lesson nesting; free tier suffices at demo scale.                                                                                                                                                                                                |
| Auth           | **Server-side sessions** — custom `Session` collection (signed cookie carries the session `_id`; Mongo TTL), bcrypt   | Instantly revocable (logout / deactivate) — JWT can't revoke before expiry without a denylist (the state JWT was meant to avoid). A hand-rolled session layer (not `express-session`) is explainable line-by-line and reuses Atlas → no Redis, no extra cost. |
| Payments       | **Stripe Checkout** (test) + webhook                                                                                  | Hosted Checkout minimizes PCI surface; enrollment created only on signature-verified webhook, never on client redirect.                                                                                                                                                                               |
| Video storage  | **Cloudflare R2** (free tier)                                                                                         | Video cost is bandwidth-dominated; R2 has **zero egress** vs S3's ~$0.09/GB. Headline cost decision.                                                                                                                                                                                                  |
| Video transfer | Browser ⇄ R2 via **presigned PUT/GET**                                                                                | API never proxies video bytes → no bandwidth/compute on the server; scales for free.                                                                                                                                                                                                                  |
| Repo           | **Monorepo** (`/client`, `/server`)                                                                                   | One repo; single source of truth; the static host builds `/client`, the managed host builds `/server`.                                                                                                                                                                                                         |

## 4. Building Blocks

- **`/client`** — Vite React SPA: public pages (home, course), auth pages, student
  dashboard, admin dashboard, video player. Talks to the API with `fetch(credentials:
'include')`.
- **`/server`** — Express API in layers: `routes → controllers → services → models`.
  - _Auth module_ — signup/login/logout, session middleware, `requireAuth` /
    `requireAdmin` guards.
  - _Catalog module_ — courses, sections, lessons (public reads, admin writes).
  - _Payment module_ — create Checkout session, webhook handler, enrollment writes.
  - _Media module_ — mint presigned PUT (admin) and presigned GET (gated on enrollment).
  - _Progress module_ — save/read playback position & completion.
- **Atlas** — collections defined in `04-data-model`.
- **R2 bucket** — private; objects keyed `lessons/{lessonId}/source.mp4`; no public access.

## 5. Runtime View (key flows)

**Auth.** Login verifies the bcrypt hash → creates a `Session` document in Mongo (TTL) → sets
the signed session-`_id` cookie with a **fresh id each login** (prevents fixation). Subsequent
API calls carry the cookie; middleware loads the session, checks expiry/`isActive`, and attaches
`req.user` (+ role). Logout deletes the session document.

**Purchase → enrollment (the integrity-critical flow).**

1. Student clicks Buy → API (auth required) creates a Stripe Checkout Session for that
   course's price, **stamping the expected amount + currency into the session metadata** (a
   price snapshot) → returns the URL → browser redirects to Stripe.
2. Student pays on Stripe → Stripe redirects back to the client success page.
3. **Independently**, Stripe POSTs `checkout.session.completed` to the API webhook (mounted with
   a **raw-body parser above `express.json`** so the signature can be verified) → API verifies the
   signature, validates the paid amount/currency against **that metadata snapshot** (not the live
   course — a mid-checkout price change must not fail a buyer who already paid), then records the
   `enrollment`.
4. **Reconciliation backstop.** If the webhook is delayed, the success page polls
   `GET /api/checkout/:sessionId/status`, which asks Stripe directly (never trusting a browser
   "I paid") and records the same enrollment. Both paths funnel through one recorder and an
   **idempotent `$setOnInsert` upsert** on the unique `{userId, courseId}` index, so the
   webhook + reconciliation race can neither double-enroll nor clobber the payment fields. The
   client success page only _reads_ enrollment state; it never creates it.

**Video playback.**

1. Student opens a lesson → client asks API for a playback URL.
2. API checks: is the lesson `isPreview`? → mint signed GET. Else is the user enrolled in
   the lesson's course? → mint signed GET (**~1 h TTL**, per request). Else 403.
3. Player streams from R2 via that URL; posts `{lessonId, seconds}` ~every 10s to the
   progress endpoint; marks complete at ≥90%.

**Admin video upload.** Admin requests an upload URL → API (admin-only) mints a presigned
PUT for `lessons/{id}/source.mp4` → browser PUTs the file straight to R2 → notifies API,
which stores the object key on the lesson.

## 6. Deployment View

- The **static host** builds `/client`, serves the SPA over a CDN. Env: API base URL.
- The **managed host** (Singapore region) builds `/server`, runs the Express API; does not sleep (paid).
  Env: Mongo URI, cookie-signing secret, Stripe secret + webhook secret, R2 credentials,
  allowed CORS origin.
- **Atlas M0** — managed Mongo; network access + DB user scoped to the API.
- **R2** — private bucket; API holds scoped access keys.
- **Stripe** — test-mode keys; webhook endpoint registered to the API host URL.

## 7. Cross-Cutting Concepts

- **Authentication & cookie transport:** the client (`coursely.app`) and API
  (`api.coursely.app`) are siblings under the registrable domain `coursely.app`.
  Since `SameSite` is scoped to the eTLD+1, requests between them are **same-site** despite being
  different origins, so the signed session cookie (`httpOnly + Secure + SameSite=Lax`,
  **host-only** — no `Domain` attribute, scoped to the API host and unreadable by sibling apps)
  is still sent on the frontend's cross-origin `fetch`. CORS is locked to the frontend origin with
  `credentials: true`. **Cookie attributes by environment:** dev (`http://localhost`) omits
  `Secure` so the cookie works over plain http; prod is `httpOnly + Secure + SameSite=Lax`,
  host-only. **Custom-domain prerequisite:** this holds only once the API serves from
  `api.coursely.app` — on a hosting platform's default subdomain the cookie is cross-site and
  blocked, so the custom domain must be wired before auth is tested in prod.
- **R2 CORS:** the bucket carries a CORS rule allowing the frontend origin for the admin's direct
  presigned **PUT** upload (an XHR, subject to CORS); plain `<video>` GET playback is not subject
  to CORS, so signed-URL delivery needs no rule.
- **CSRF:** `SameSite=Lax` blocks the cross-site request shapes that drive CSRF, so it is
  the primary defense. Defense-in-depth on mutating routes (origin/referer check or CSRF
  token) is specified in `06-security` as an additional, lighter layer.
- **Authorization:** role-based only (`requireAdmin`); no per-resource ownership (single
  platform-owner Admin per `01`).
- **Config & secrets:** all secrets via environment only; never in the repo or client
  bundle (NFR-5).
- **Validation & errors:** schema validation at the route boundary; consistent JSON error
  shape; never leak stack traces or secret-bearing messages to the client.

## 8. Architecture Decisions (log)

Decisions significant + not-easily-reversed enough to record (full ADRs optional):

- **AD-1 R2 over S3** for zero egress (cost).
- **AD-2 Server-side sessions over JWT** for instant revocation; a **custom `Session`
  collection** (not `express-session`) to stay explainable line-by-line (security/cost).
- **AD-3 Managed platform over a self-managed VM** — fits a stateless API; avoids ops &
  security burden.
- **AD-4 Direct-to-R2 presigned transfer** — keep video bytes off the API.
- **AD-5 Enrollment via verified webhook only** — payment integrity.
- **AD-6 Sibling subdomains under one owned domain** (client + API) → same-site →
  `SameSite=Lax` host-only session cookie. Chosen over the hosting platforms' default subdomains
  (cross-site, would force `SameSite=None`): stronger CSRF posture at ₹0 (domain already
  owned). Cookie is host-only so the sibling storage app cannot read it.

## 9. Risks

- **CSRF** — largely neutralized by same-site `SameSite=Lax` cookies (AD-6); a lighter
  origin-check / token layer on mutations is added in `06` as defense-in-depth.
- **R2/Stripe credential leakage** — mitigated by env-only secrets + scoped keys.
- **Single API instance** — acceptable at demo scale; no HA target in v1.

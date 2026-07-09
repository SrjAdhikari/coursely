---
status: approved
version: 1.3
date: 2026-07-09
---

# 03 — Architecture

Anchored to arc42 (lightweight). This doc captures and justifies the stack.

## 1. Goals & Constraints

Deliver the requirements in `02` under two standing priorities: favor managed services over
self-managed infrastructure, and keep every layer straightforward to reason about. These
priorities push consistently toward **managed services over self-managed infra** and
**direct-to-storage video transfer** (bytes never touch the API).

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
| Frontend       | React 19 + Vite + **TypeScript** · Tailwind + **shadcn/ui** · **TanStack Query** + axios, hosted on a **static/CDN host** | CDN-served SPA; no SSR need for a small catalog.                                                                                                                                                                                                                                           |
| API            | **Express 5 + TypeScript** on a **managed host** (always-on); **zod** validation                                             | Stateless API moves no video → a managed platform removes the server-hardening and ops burden. A self-managed VM was rejected: nothing heavy runs on the box, so it only adds an ops + security surface. A scale-to-zero / sleeping tier was rejected: cold-start latency on the first request is a poor user experience.                                |
| Database       | **MongoDB Atlas M0**                                                                                           | Natural for MERN; the document model fits course→section→lesson nesting; the M0 tier suffices at launch scale.                                                                                                                                                                                                |
| Auth           | **Server-side sessions** — custom `Session` collection (signed cookie carries the session `_id`; Mongo TTL), bcrypt   | Instantly revocable (logout / deactivate) — JWT can't revoke before expiry without a denylist (the state JWT was meant to avoid). A hand-rolled session layer (not `express-session`) is auditable line-by-line and reuses Atlas → no Redis, one fewer moving part. |
| Payments       | **Stripe Checkout** (test) + webhook                                                                                  | Hosted Checkout minimizes PCI surface; enrollment created only on signature-verified webhook, never on client redirect.                                                                                                                                                                               |
| Video storage  | **Cloudflare R2**                                                                                         | R2 exposes an S3-compatible API, so the browser transfers video directly via presigned PUT/GET and the API never proxies bytes. Key storage decision.                                                                                                                                                                                                  |
| Video transfer | Browser ⇄ R2 via **presigned PUT/GET**                                                                                | API never proxies video bytes → no media bandwidth or compute on the server; the API scales independently of media volume.                                                                                                                                                                                                                  |
| Repo           | **Monorepo** (`/client`, `/server`)                                                                                   | One repo; single source of truth; the static host builds `/client`, the managed host builds `/server`.                                                                                                                                                                                                         |

## 4. Building Blocks

- **`/client`** — Vite React SPA: public pages (home, course), auth pages, student
  dashboard, admin dashboard, video player. Talks to the API with `fetch(credentials:
'include')`.
- **`/server`** — Express API in layers: `routes → controllers → services → models`.
  - _Auth module_ — signup/login/logout, session middleware, `requireAuth` /
    `requireAdmin` guards.
  - _Catalog module_ — courses, sections, lessons (public reads, admin writes);
    `lessonCount`/`totalDuration` are tallied on read. The public homepage hero stats
    derive from the published-courses API — course count, Σ `lessonCount`, and
    Σ `totalDuration` in whole hours.
  - _Payment module_ — create Checkout session, webhook handler, enrollment writes.
  - _Media module_ — mint presigned PUT (admin) and presigned GET (gated on enrollment).
  - _Progress module_ — record playback position; completion is derived server-side.
  - _Learning module_ — aggregates the caller's enrollments + progress into
    `GET /api/learning/overview` (`{ stats, courses, recentLessons }`), powering the
    student dashboard and My Courses.
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

1. Student opens a lesson → client asks API for a playback URL (`optionalAuth` — a
   session is used if present but is not required).
2. API resolves visibility first: a **draft/unpublished** course returns `404` to
   non-admins (no existence leak). On a **published** course, a **preview** lesson mints a
   signed GET even for a **logged-out** visitor; a paid lesson requires auth **then**
   enrollment (`401` → `403`); admins bypass. The signed GET is **~1 h TTL**, per request.
3. Player streams from R2 via that URL; posts `{ positionSeconds }` ~every 10–15s to the
   progress endpoint. **Completion is derived server-side at ≥95% and is sticky** — the
   client cannot self-declare `completed`, and once set it never un-completes.

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

- **Authentication & cookie transport:** the client and API are served from **independent
  origins** (separate hosts), so requests between them are **cross-site**. The signed session
  cookie is therefore `httpOnly + Secure + SameSite=None` (**host-only** — no `Domain`
  attribute, so it is scoped to the API host and unreadable by any other app), which is what
  lets the browser send it on the frontend's cross-origin `fetch`. CORS is locked to the single
  frontend origin with `credentials: true`. **Cookie attributes by environment:** prod is
  `httpOnly + Secure + SameSite=None`, host-only; local dev is same-origin over
  `http://localhost`, so it omits `Secure` and uses `SameSite=Lax`. Because the cookie is
  cross-site, `SameSite` no longer defends CSRF — an `Origin`/`Referer` guard on mutations does
  (see the CSRF note below and `06 §3`).
- **R2 CORS:** the bucket carries a CORS rule allowing the frontend origin for the admin's direct
  presigned **PUT** upload (an XHR, subject to CORS); plain `<video>` GET playback is not subject
  to CORS, so signed-URL delivery needs no rule.
- **CSRF:** because the session cookie is `SameSite=None` (cross-site origins), `SameSite`
  is **not** the CSRF control. The primary defense is an `Origin`/`Referer` guard on every
  mutating route (`verifyRequestOrigin`), rejecting requests whose origin isn't the known
  frontend with `403 CSRF_ORIGIN_MISMATCH`. Detailed in `06-security §3`. No CSRF token.
- **Authorization:** role-based only (`requireAdmin`); no per-resource ownership (single
  platform-owner Admin per `01`).
- **Config & secrets:** all secrets via environment only; never in the repo or client
  bundle (NFR-5).
- **Validation & errors:** schema validation at the route boundary; consistent JSON error
  shape; never leak stack traces or secret-bearing messages to the client.

## 8. Architecture Decisions (log)

Decisions significant + not-easily-reversed enough to record (full ADRs optional):

- **AD-1 Object storage on Cloudflare R2** — S3-compatible presigning enables direct browser transfer (AD-4); video bytes never sit on or traverse the API.
- **AD-2 Server-side sessions over JWT** for instant revocation; a **custom `Session`
  collection** (not `express-session`) to stay auditable line-by-line (security).
- **AD-3 Managed platform over a self-managed VM** — fits a stateless API; avoids ops &
  security burden.
- **AD-4 Direct-to-R2 presigned transfer** — keep video bytes off the API.
- **AD-5 Enrollment via verified webhook only** — payment integrity.
- **AD-6 Independent origins for client + API** (separate hosts) → cross-site → session
  cookie is `SameSite=None; Secure`, host-only. Because a cross-site cookie is still sent on
  cross-origin requests, `SameSite` can't carry the CSRF defense, so an `Origin`/`Referer`
  guard on mutating routes is the primary CSRF control (`06 §3`). Cookie stays host-only (no
  `Domain` attribute) so no other app on a shared parent domain can read it.
- **AD-7 Read-side catalog tallies** — `lessonCount`/`totalDuration` are computed on read
  via a plain `Lesson.find` + in-memory tally (chosen for simplicity/readability over a
  `$group` aggregation), not denormalized onto the course.

## 9. Risks

- **CSRF** — the session cookie is `SameSite=None` (cross-site origins), so an
  `Origin`/`Referer` guard on mutating routes is the primary defense (AD-6, `06 §3`), not
  `SameSite`.
- **R2/Stripe credential leakage** — mitigated by env-only secrets + scoped keys.
- **Single API instance** — acceptable at launch scale; no HA target in v1.

---
status: approved
version: 1.4
date: 2026-06-28
---

# 05 — API

Plain **REST/JSON over HTTPS**, resource-oriented, mounted under `/api`. The contract
between the Vite client and the Express server. The per-route **RBAC matrix** (§4) is the
primary evidence of access-control design (NFR-1).

> **Implementation note.** A few names/paths in the shipped API differ from the original draft
> below: **`POST /api/auth/register`** (not `/signup`); **admin catalog writes live under
> `/api/admin/*`** (e.g. `POST /api/admin/courses`, `PATCH /api/admin/courses/:id`), not the flat
> `/courses` paths in §2/§4; the auth guard is **`authenticate`** (not `requireAuth`). The
> **Progress** endpoints and the aggregate **`GET /api/me/dashboard`** are the only sections still
> planned for a later release; **Media**, **Payments**, and **Enrollment** are live. The shipped
> auth + catalog + admin surface is documented in
> [`authentication/auth-and-sessions.md`](./authentication/auth-and-sessions.md),
> [`authorization/rbac.md`](./authorization/rbac.md), and
> [`course-domain/catalog-and-admin.md`](./course-domain/catalog-and-admin.md).

## 1. Conventions

- **Format:** JSON in/out. Success returns the resource or `{ data }`; errors return a
  consistent shape `{ error: { code, message } }` — **never** stack traces or
  secret-bearing text (NFR-4).
- **Auth transport:** session-id cookie (httpOnly + Secure + SameSite=Lax), sent
  automatically by the browser on same-site requests to `api.coursely.app`. No tokens in
  headers.
- **Validation:** every request body/param is schema-validated at the route boundary
  before use; invalid input → `400` with a field-level message (NFR-4).
- **Guards:** `requireAuth` (valid session) and `requireAdmin` (`role === admin`)
  middleware; admin routes apply both. Authorization is always server-side (NFR-1).
- **Status codes:** `200/201` success, `400` validation, `401` unauthenticated, `403`
  forbidden (wrong role / not enrolled), `404` not found, `409` conflict (duplicate),
  `429` rate-limited.
- **Rate limiting:** auth routes (`signup`, `login`) are rate-limited per IP (NFR-6).

## 2. Resource Routes

### Auth
- `POST /api/auth/signup` — create student account, start session.
- `POST /api/auth/login` — verify bcrypt, start session (rate-limited).
- `POST /api/auth/logout` — destroy session server-side.
- `GET  /api/auth/me` — current user `{ id, name, email, role }`.

### Catalog (public reads, admin writes)
- `GET  /api/courses` — list published courses; `?q=` runs text search (FR-2).
- `GET  /api/courses/:slug` — course detail + curriculum (sections + lessons with
  `isPreview`/locked flags). **`videoKey` / `trailerKey` are never returned** (the trailer is
  fetched via its own signed-URL route below).
- `POST /api/courses` — create course.
- `PATCH /api/courses/:id` — edit course.
- `DELETE /api/courses/:id` — delete course; **`409` if any enrollment exists** (unpublish
  instead — see `04 §6`); otherwise cascades sections, lessons, R2 objects, orphan progress.
- `POST /api/courses/:courseId/sections` · `PATCH /api/sections/:id` · `DELETE /api/sections/:id`
- `POST /api/sections/:sectionId/lessons` · `PATCH /api/lessons/:id` · `DELETE /api/lessons/:id`

### Media
- `POST /api/lessons/:id/upload-url` — admin; mint presigned **PUT** for
  `lessons/{id}/source.mp4`. API never receives video bytes (FR-21, AD-4).
- `PATCH /api/lessons/:id/video` — admin; store the `videoKey` after the browser's direct
  PUT to R2 succeeds.
- `GET  /api/lessons/:id/playback-url` — mint presigned **GET** (~1 h TTL, per request) **iff** the
  lesson `isPreview` (anyone) **or** the requester is authenticated and enrolled in the
  lesson's course; otherwise `403` (FR-17, NFR-3).
- `POST /api/courses/:id/trailer-url` — **admin**; mint presigned **PUT** for
  `courses/{id}/trailer.mp4`; store `trailerKey` via `PATCH /api/courses/:id` after the
  browser's direct PUT to R2 succeeds.
- `GET  /api/courses/:slug/trailer-url` — **public, ungated**; mint a short-lived presigned
  **GET** for the course trailer (no auth, no enrollment — it is marketing); `404` if the
  course has no `trailerKey`. Distinct from preview lessons (FR-3).

### Payments
- `POST /api/checkout` — **student** (`authenticate`); body `{ courseId }` (validated). Creates a
  Stripe hosted-Checkout Session for the **published** course at its stored price and returns
  `{ url }` (the hosted Checkout URL to redirect to). Errors: `404 COURSE_NOT_FOUND` (missing **or
  a draft** — a draft never leaks), `409 ALREADY_ENROLLED`. **Stamps
  `{ userId, courseId, expectedAmount, expectedCurrency }` into the Session `metadata`** — the sole
  link the (sessionless) webhook and the reconciliation endpoint use to know who/what to enroll,
  plus the price snapshot they validate against. Sets `success_url` / `cancel_url`. Prices are
  integer paise passed **1:1** as Stripe `unit_amount` (no ×100).
- `POST /api/webhooks/stripe` — **see §3**; signature-verified (no session); records the
  enrollment. Returns a bare `{ received: true }` `200`.
- `GET /api/checkout/:sessionId/status` — **student, own session**; **reconciliation fallback** —
  the server independently retrieves the Checkout Session from Stripe, **asserts
  `session.metadata.userId === req.user.id`** (a student cannot act on another user's `sessionId` —
  IDOR, `06 §2-E`), and if `payment_status === 'paid'` confirms/creates the enrollment (idempotent,
  via the shared recorder). Returns `{ enrolled, status, course? { slug, title } }` — `course` is
  present only when paid + enrolled; a pending session returns `{ enrolled: false, status }`.
  Errors: `404 CHECKOUT_SESSION_NOT_FOUND`, `403 UNAUTHORIZED_ACCESS`. Backstop for a
  delayed/failed webhook (see §3).

### Enrollment & dashboard
- `GET /api/enrollments/me` — **student**; the caller's enrollments → "My Courses", newest-first,
  each with its course summary populated (`title`, `slug`, `thumbnailUrl`, `instructorName`,
  `price`, `currency`).
- `GET /api/admin/enrollments?page&limit` — **admin**; every enrollment — who bought what + when
  (FR-23). Paginated: `page` (default `1`) and `limit` (default `10`, **max `100`**), newest-first.
  Returns `{ items, pagination { page, limit, total, totalPages } }`, each item's `userId`
  populated `{ name, email }` and `courseId` `{ title }`.
- `GET /api/me/dashboard` — **student**; aggregated: enrolled courses, per-course progress %,
  "continue learning" (next incomplete lesson), recently watched (FR-18). *(Planned — not yet
  built.)*

### Progress
- `PUT /api/progress/:lessonId` — student; upsert `{ seconds, completed }`. Allowed only
  if enrolled in the lesson's course (or lesson is preview). Idempotent upsert (FR-15/16).
- `GET /api/progress/course/:courseId` — student; progress map for a course's player UI.

### Admin — student management
- `GET   /api/admin/students` — list students.
- `GET   /api/admin/students/:id` — student detail + their enrollments.
- `PATCH /api/admin/students/:id` — toggle `role`, toggle `isActive`. **Cannot** set
  passwords or create enrollments (FR-22).

## 3. The Stripe Webhook (deliberate exception)

`POST /api/webhooks/stripe` is the **only** unauthenticated endpoint that writes to the
database. Its authenticity comes from the **Stripe signature**, not a session:

- Mounted with a **raw-body** parser **before** the global JSON parser — Stripe's
  signature is computed over the exact bytes; the JSON parser would mutate them and break
  verification.
- Handler verifies `Stripe-Signature` against the webhook secret. On
  `checkout.session.completed`: read `{ userId, courseId }` from the session **`metadata`**
  (stamped at `POST /api/checkout`), validate `amount_total`/`currency` against the
  **`expectedAmount`/`expectedCurrency` snapshot in that same `metadata`** — **not the live course
  record**, so a mid-checkout admin price change can't fail a buyer who has already paid — then
  upsert the enrollment for that user+course. A mismatch is **logged (`PAYMENT_AMOUNT_MISMATCH`)
  and skipped, never thrown**, so the webhook still acknowledges `200` and Stripe stops retrying.
  The unique `{userId, courseId}` index makes the handler safe under Stripe's at-least-once retries
  (NFR-2, FR-11/13).

**Failure / reconciliation.** If the API is down or errors when Stripe POSTs, Stripe
**retries with backoff for ~3 days**, so transient outages self-heal. As a synchronous
backstop, the client success page (which holds the `session_id`) calls
`GET /api/checkout/:sessionId/status`; the server **independently** fetches that Checkout
Session from Stripe and, if `payment_status === 'paid'`, confirms the enrollment. This is
still server-verified (the server asks Stripe directly — it does not trust the browser's
"I paid"), and the unique index keeps it idempotent against the webhook, so a student is
never left charged-without-access by a late webhook.

**Local testing.** The Stripe CLI bridges webhooks to localhost:
`stripe listen --forward-to localhost:8080/api/webhooks/stripe` prints a **local** signing
secret (distinct from the prod `STRIPE_WEBHOOK_SECRET`), and `stripe trigger
checkout.session.completed` replays events for the idempotency/amount tests.

## 4. RBAC Matrix

| Route | Public | Student (auth) | Admin |
|---|:---:|:---:|:---:|
| `GET /courses`, `GET /courses/:slug` | ✓ | ✓ | ✓ |
| `GET /lessons/:id/playback-url` (preview lesson) | ✓ | ✓ | ✓ |
| `GET /lessons/:id/playback-url` (paid lesson) | ✗ | ✓ if enrolled | ✓ |
| `POST /auth/signup`, `POST /auth/login` | ✓ | — | — |
| `POST /auth/logout`, `GET /auth/me` | ✗ | ✓ | ✓ |
| `POST /checkout` | ✗ | ✓ | ✓ |
| `GET /checkout/:sessionId/status` | ✗ | ✓ (own session) | ✓ |
| `PUT /progress/:lessonId`, `GET /me/dashboard`, `GET /enrollments/me` | ✗ | ✓ | ✓ |
| `POST/PATCH/DELETE /courses`, `/sections`, `/lessons` | ✗ | ✗ | ✓ |
| `POST /lessons/:id/upload-url`, `PATCH /lessons/:id/video` | ✗ | ✗ | ✓ |
| `GET /admin/enrollments`, `/admin/students*` | ✗ | ✗ | ✓ |
| `POST /webhooks/stripe` | signature-gated (no session) | | |

## 5. Open Questions (tracked in 07-plan)

- Pagination on admin lists: **`/admin/enrollments` now ships `?page&limit`** (default `10`,
  max `100`); `/admin/students` pagination is still deferred — trivial dataset at demo scale,
  add only if the list grows.
- Whether `/me/dashboard` is one aggregate endpoint or composed client-side from smaller
  reads — decided during implementation by what keeps the dashboard query simple.

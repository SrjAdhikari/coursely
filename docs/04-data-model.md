---
status: approved
version: 1.2
date: 2026-06-23
---

# 04 — Data Model

Conceptual → logical → physical for MongoDB (Atlas). Seven collections, **referenced**
(not embedded), chosen so lessons are first-class documents that progress and signed-URL
playback can address by `_id`.

## 1. Modeling Approach

Reference over embed for the course→section→lesson tree. Rationale: the hottest
operations (playback authorization, progress writes, completion calc) all act on a
**single lesson**, so a lesson must be an independently addressable document. Embedding
would force array-digging inside a course doc on every playback. The curriculum view
(course page) is still a single indexed query per collection. Money is stored as integer
**paise** to avoid floating-point errors; timestamps are UTC.

## 2. Collections

### users

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | string | |
| `email` | string | **unique**, lowercased |
| `passwordHash` | string | bcrypt; plaintext never stored (FR-6) |
| `role` | enum `student\|admin` | default `student`; authorization source (FR-9) |
| `isActive` | boolean | default `true`; `false` blocks login (FR-22) |
| `createdAt` / `updatedAt` | Date | |

### sessions

| Field | Type | Notes |
|---|---|---|
| `_id` | string | the session id — the value stored in the signed `httpOnly` cookie |
| `userId` | ObjectId → users | session owner |
| `expiresAt` | Date | **TTL index** — Mongo auto-expires the row; logout deletes it explicitly |
| `createdAt` | Date | |

Custom session store (not `express-session`): one document per active login, addressed by the
opaque `_id` carried in the cookie. Mirrors the TroveCloud auth pattern; a fresh `_id` is issued
on each login (session-fixation defense, `06`).

### courses

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `title` | string | |
| `slug` | string | **unique**; `slugify(title)` + short collision suffix; used in public course URL |
| `description` | string | |
| `instructorName` | string | display string only — no instructor *role* exists |
| `thumbnailUrl` | string | image URL |
| `trailerKey` | string? | R2 object key `courses/{_id}/trailer.mp4` for the intro/trailer (FR-3); private — served via an **ungated** signed GET, never a public URL |
| `price` | int | **paise** (₹499 → `49900`) |
| `currency` | string | `INR` |
| `isPublished` | boolean | drafts hidden from public listing |
| `createdAt` / `updatedAt` | Date | |

### sections

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `courseId` | ObjectId → courses | |
| `title` | string | |
| `order` | int | sort within course |

### lessons

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | the unit progress & playback key off |
| `sectionId` | ObjectId → sections | |
| `courseId` | ObjectId → courses | **denormalized** — avoids lesson→section→course lookup on every playback/progress op (Q2) |
| `title` | string | |
| `order` | int | sort within section |
| `isPreview` | boolean | `true` → playable without enrollment (FR-4) |
| `videoKey` | string | R2 object key `lessons/{_id}/source.mp4`; never a public URL |
| `duration` | int | seconds; denominator for ≥90%-complete calc (FR-16) |

### enrollments

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `userId` | ObjectId → users | |
| `courseId` | ObjectId → courses | |
| `stripeSessionId` | string | Checkout session that paid for it (audit trail) |
| `amountPaid` | int | paise actually charged |
| `currency` | string | validated against course at webhook time (NFR-2) |
| `createdAt` | Date | purchase time |

### progress

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `userId` | ObjectId → users | |
| `lessonId` | ObjectId → lessons | |
| `courseId` | ObjectId → courses | **denormalized** — dashboard aggregates progress per course in one query |
| `seconds` | int | last playback position; resume point (FR-15) |
| `completed` | boolean | set `true` at ≥90% watched (FR-16) |
| `updatedAt` | Date | powers "recently watched" sort (FR-18) |

## 3. Relationships

- `course` 1—N `section` 1—N `lesson` (referenced by `courseId` / `sectionId`).
- `user` N—N `course` via `enrollment` (the join collection).
- `user` × `lesson` 1—1 `progress` (one record per user-lesson, upserted).
- `user` 1—N `session` (one per active login; TTL-expired).

## 4. Indexes

- `users.email` — **unique**.
- `sessions.expiresAt` — **TTL index** (auto-expiry); `sessions.userId` for "log out everywhere".
- `courses.slug` — **unique**; `courses` **text index** on `title, description,
  instructorName` (FR-2 search).
- `sections.courseId`; `lessons.courseId`; `lessons.sectionId` — curriculum & playback reads.
- `enrollments.{userId, courseId}` — **unique compound** → duplicate enrollment is
  physically impossible; makes the Stripe webhook **idempotent** on retries (FR-13, NFR-2).
- `progress.{userId, lessonId}` — **unique compound**; progress writes are upserts.
- `progress.{userId, updatedAt}` — "recently watched" query.

## 5. Access Patterns (what justifies the shape)

- **Homepage / search** — `courses.find({isPublished:true})` + text search; single indexed query (NFR-10).
- **Course page** — one `course` + its `sections` + `lessons` by `courseId`; preview flags drive lock icons.
- **Playback auth** — given `lessonId`: load lesson → if `isPreview` mint signed GET; else
  check `enrollments.{userId, lesson.courseId}` exists → mint or 403. `courseId` on the
  lesson means no extra section/course lookup.
- **Progress save** — upsert `progress.{userId, lessonId}` every ~10s.
- **Dashboard** — `enrollments` by `userId` → courses; per-course % from `progress`
  grouped by `courseId`; "continue" = lowest-`order` incomplete lesson; "recently watched"
  = `progress` by `{userId, updatedAt desc}`.

## 6. Integrity & Lifecycle

- Deleting a course is **blocked (`409`) while any enrollment exists** — the admin must
  unpublish (`isPublished=false`) instead, so the Stripe payment audit trail (`06 §R`,
  non-repudiation) is never destroyed. A course with **zero** enrollments may be
  hard-deleted, which cascades to its sections, lessons, lesson R2 objects, the course
  **trailer R2 object** (`trailerKey`), and any orphan `progress` (handled in the service
  layer; Mongo has no FK cascade).
- Enrollment is **append-only** in v1 (no un-enroll / refund — out of scope per `01`).
- `progress` is created lazily on first play of a lesson.
- Denormalized `courseId` is write-once (a lesson never changes course), so no sync risk.

## 7. Open Questions (tracked in 07-plan)

- Whether to add a `courses.lessonCount` cached field vs computing it — deferred; cheap to
  compute at demo scale, revisit only if the course page shows N+1 behavior.

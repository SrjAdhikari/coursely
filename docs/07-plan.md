---
status: approved
version: 1.2
date: 2026-06-23
---

# 07 — Implementation Plan

Sequenced build order under the real constraints (`01`): small team, lean timeline. The set
of decisions is frozen in `01`–`06`; this doc turns them into an order of operations and
parks everything deferred.

## 1. Sequencing Principle

**Deploy a thin slice end-to-end first, then thicken it.** Get an (almost empty)
client + API + DB + R2 wired together and *live on the real domain* before building
features. Rationale: the hard, demo-killing problems — CORS, the SameSite cookie across
subdomains, the Stripe webhook reaching a public URL — are *integration* problems that
only appear once deployed. Discovering them early is cheap; discovering them at the end is
expensive. Everything after M0 is layered onto a thing already proven to deploy. Mandatory
capabilities come before any optional extras.

## 2. Milestones

### M0 — Infra + Auth live
- Monorepo scaffold: `/client` (Vite React), `/server` (Express, layered).
- Deploy pipeline live: the static host builds `/client`; the managed host (paid) builds `/server`; Atlas M0
  connected; R2 bucket created (private).
- Domain wired: `coursely.app` → static host, `api.coursely.app` → managed host, SSL on both;
  CORS locked to the frontend origin; session cookie `httpOnly+Secure+SameSite=Lax`.
- Auth end-to-end: signup / login / logout / session (custom `Session` collection), bcrypt,
  `requireAuth`/`requireAdmin`, rate limiting + helmet.
- **Exit:** a real user can register, log in, and log out on the live domain.

### M1 — Catalog + content
- Course / section / lesson models + admin CRUD (FR-19/20). Course delete is **blocked
  (`409`) once enrollments exist** (unpublish instead — `04 §6`).
- Admin dashboard UI for catalog management.
- Public homepage (hero, featured, course cards, search) + public course pages
  (curriculum, preview/lock flags, a distinct **R2-hosted trailer** + preview lessons,
  thumbnail fallback when no trailer) (FR-1/2/3).
- R2 presigned PUT upload (admin) + presigned GET playback for **preview** lessons and the
  **course trailer** (ungated) (FR-21, FR-4, FR-3).
- Seed 3 courses (HTML/CSS/JS), ≥5 lessons each, 2–3 preview each.
- **Exit:** public can browse/search/preview; admin can manage the catalog and upload video.

### M2 — Payments + gating
- Stripe Checkout session creation at the course's stored price, **stamping
  `{userId, courseId}` into session metadata** (FR-10).
- Webhook: raw-body mount, signature verify, read `{userId,courseId}` from metadata,
  amount/currency validation → create enrollment; unique index makes it idempotent
  (FR-11/13, NFR-2). Reconciliation endpoint asserts session ownership (`metadata.userId
  === req.user._id`) before acting.
- Paid-lesson playback gating: enrollment check before minting the signed GET (FR-17).
- **Exit:** full purchase → enroll → watch flow works in Stripe test mode.

### M3 — Learning experience + hardening
- Video player: keyboard shortcuts, fullscreen, seek (FR-14).
- Progress: save `{lessonId, seconds}` ~10s, resume, ≥90% complete (FR-15/16).
- Student dashboard: My Courses, Continue Learning, progress %, recently watched (FR-18).
- Security pass: Origin/Referer CSRF check on mutations, input-validation sweep,
  consistent error shape.
- Responsive/mobile polish (NFR-8); a few tests (auth, webhook/payment, access control).
- **Exit:** dashboard + resume work; security controls verifiably in place.

### M4 — Polish + buffer
- Final live-demo smoke test of the whole flow.
- Optional extras **only if time remains:** HLS/multi-quality, PiP/speed/subtitles, more
  tests.

## 3. Deferred Backlog

Parked deliberately (`01` non-goals): HLS / adaptive streaming, FFmpeg multi-quality
transcode + quality switching, async server-side transcoding on admin upload, PiP / speed
control / subtitles, multiple admins / instructor ownership,
reviews/ratings/certificates/coupons/refunds.

## 4. Open Questions (consolidated)

- Exact keyboard-shortcut set; whether speed/PiP/subtitles make the cut (`02`).
- Whether HLS/multi-quality is attempted as a stretch (`01`/`02`).
- `courses.lessonCount` cached field vs computed (`04`).
- Pagination on admin lists (`05`).
- `/me/dashboard` as one aggregate endpoint vs composed client-side (`05`).

All are implementation-time decisions; none blocks starting M0.

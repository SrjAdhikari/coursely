---
status: approved
version: 1.5
date: 2026-07-09
---

# 07 - Implementation Plan

Sequenced build order (`01`). The set
of decisions is frozen in `01`-`06`; this doc turns them into an order of operations and
parks everything deferred.

## 1. Sequencing Principle

**Deploy a thin slice end-to-end first, then thicken it.** Get an (almost empty)
client + API + DB + R2 wired together and *live on the real domain* before building
features. Rationale: the hard, launch-blocking problems - CORS, the cross-site `SameSite=None`
session cookie, the Stripe webhook reaching a public URL - are *integration* problems that
only appear once deployed. Discovering them early is cheap; discovering them at the end is
expensive. Everything after M0 is layered onto a thing already proven to deploy. Core
capabilities come before any optional extras.

## 2. Milestones

### M0 - Infra + Auth live
- Monorepo scaffold: `/client` (Vite React), `/server` (Express, layered).
- Deploy pipeline live: the static host builds `/client`; the managed host (paid) builds `/server`; Atlas M0
  connected; R2 bucket created (private).
- Frontend + API deployed on their own origins (separate hosts), SSL on both; CORS locked to
  the frontend origin; session cookie `httpOnly+Secure+SameSite=None`, host-only (cross-site).
- **Origin/Referer CSRF guard ships with the cross-site cookie** - a `SameSite=None` cookie
  can't defend CSRF on its own, so its Origin/Referer check is in place from the first live
  slice, not deferred (`06 §3`).
- Auth end-to-end: signup / login / logout / session (custom `Session` collection), bcrypt,
  `requireAuth`/`requireAdmin`, rate limiting + helmet.
- **Exit:** a real user can register, log in, and log out on the live domain.

### M1 - Catalog + content
- Course / section / lesson models + admin CRUD (FR-19/20). Course delete is **blocked
  (`409`) once enrollments exist** (unpublish instead - `04 §6`).
- Admin dashboard UI for catalog management.
- Public homepage (hero, featured, course cards, search) + public course pages
  (curriculum, preview/lock flags, a distinct **R2-hosted trailer** + preview lessons,
  thumbnail fallback when no trailer) (FR-1/2/3).
- R2 presigned PUT upload (admin) + presigned GET playback for **preview** lessons and the
  **course trailer** (ungated) (FR-21, FR-4, FR-3).
- Seed 3 courses (HTML/CSS/JS), ≥5 lessons each, 2-3 preview each.
- **Exit:** public can browse/search/preview; admin can manage the catalog and upload video.
- **Status - delivered:** public homepage, course pages (curriculum, category, "What you'll
  learn" outcomes), preview/lock flags, and the anonymous preview player are live.

### M2 - Payments + gating
- Stripe Checkout session creation at the course's stored price, **stamping
  `{userId, courseId}` into session metadata** (FR-10).
- Webhook: raw-body mount, signature verify, read `{userId,courseId}` from metadata,
  amount/currency validation → create enrollment; unique index makes it idempotent
  (FR-11/13, NFR-2). Reconciliation endpoint asserts session ownership (`metadata.userId
  === req.user._id`) before acting.
- Paid-lesson playback gating: enrollment check before minting the signed GET (FR-17).
- **Exit:** full purchase → enroll → watch flow works in Stripe test mode.

### M3 - Learning experience + hardening
- Video player: keyboard shortcuts, fullscreen, seek (FR-14).
- Progress: save `positionSeconds` ~10-15s, resume, **≥95%** server-derived sticky complete (FR-15/16).
- Student dashboard: My Courses, Continue Learning, progress %, recently watched (FR-18).
- Security pass: input-validation sweep and consistent error shape (the Origin/Referer CSRF
  guard already shipped with the cross-site cookie in M0).
- Responsive/mobile polish (NFR-7); a few tests (auth, webhook/payment, access control).
- **Exit:** dashboard + resume work; security controls verifiably in place.
- **Status - delivered:** progress tracking (save/resume + sticky auto-complete), the
  LearnPage player, and the student dashboard are live.

### M4 - Polish
- Final pre-launch smoke test of the whole flow.
- Optional extras **for a later release:** HLS/multi-quality, PiP/speed/subtitles, more
  tests.

## 3. Deferred Backlog

Parked deliberately (`01` non-goals): HLS / adaptive streaming, FFmpeg multi-quality
transcode + quality switching, async server-side transcoding on admin upload, PiP / speed
control / subtitles, multiple admins / instructor ownership,
reviews/ratings/certificates/coupons/refunds.

## 4. Open Questions (consolidated)

- Exact keyboard-shortcut set; whether speed/PiP/subtitles make the cut (`02`).
- Whether HLS/multi-quality is attempted as a stretch (`01`/`02`).
- **Resolved** - `courses.lessonCount` (+ `totalDuration`) are computed on read, not cached (`04`).
- Pagination on admin lists (`05`).
- **Resolved** - the learning dashboard ships as one aggregate endpoint, `GET /api/learning/overview` (`05`).

All are implementation-time decisions; none blocks starting M0.

## 5. Design Rationale - key decisions & why

Each decision below shows **what we chose and why.**
(The "deploy a thin slice first" principle explains itself in `§1`.)

### Build the core experience first, extras later
- **Choice.** Build the main path - browse, buy, watch, resume - first. Nice-to-haves like adjustable video quality, picture-in-picture, playback speed, and subtitles wait for a later release (M4, `§3`).
- **Why.** What matters for launch is that people can buy a course and learn from it. The extras add cost and complexity but nothing that has to be there to launch.

### Postponed work is written down with its reason, not deleted
- **Choice.** Anything left out of this version is listed in a "deferred" section (`§3`) along with why, instead of being quietly dropped.
- **Why.** It keeps the "put off, not forgotten" intent on record, so a later release has the background and we don't end up re-arguing decisions we already made.

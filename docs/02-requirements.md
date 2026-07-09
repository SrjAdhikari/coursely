---
status: approved
version: 1.4
date: 2026-07-09
---

# 02 — Requirements

Each requirement is testable. **FR** = functional (what it does), **NFR** = non-functional
(how well — performance, security, and operability).

## Functional Requirements

### Public / unauthenticated

- **FR-1** Anyone can view the homepage without logging in: hero section, featured
  courses, and a grid of course cards (thumbnail, title, instructor, price, category,
  lesson count, and total duration).
- **FR-2** Anyone can search courses from the homepage; search matches course **title,
  description, and instructor name** (Mongo text index). No lesson-level search. Catalog
  category chips and filtering are derived client-side from the loaded course list.
- **FR-3** Anyone can open a course page without logging in and see: title, thumbnail,
  instructor, description, curriculum (sections + lesson list), lesson count, price,
  **preview lessons** (FR-4), and a distinct **trailer / introduction video**. The trailer
  is a short course-level clip self-hosted in R2 (`courses.trailerKey`), served **ungated**
  via a short-lived signed URL (no enrollment needed — it is marketing). If a course has no
  trailer, the page falls back to the thumbnail.

- **FR-4** Lessons flagged `isPreview` are playable by anyone (no login, no enrollment).
  All other lessons are locked.
- **FR-24** Each course carries a **category** and a list of **learning outcomes** ("What
  you'll learn"); both are shown on the public course page.

### Authentication & authorization

- **FR-5** A visitor can sign up (email + password), log in, and log out.
- **FR-6** Passwords are stored hashed (bcrypt); plaintext is never stored or logged.
- **FR-7** Sessions are server-side (opaque session ID in an httpOnly + Secure +
  SameSite cookie); logout invalidates the session server-side immediately.
- **FR-8** Student-only routes (dashboard, paid playback) reject unauthenticated requests.
- **FR-9** Admin-only routes (all management) reject non-admin sessions with 403.

### Purchase & enrollment

- **FR-10** A logged-in student can purchase a single course via Stripe Checkout (test
  mode), one-time payment at the course's own price.
- **FR-11** Enrollment is created **only** on a signature-verified Stripe webhook
  (`checkout.session.completed`) — never on the client success redirect.
- **FR-12** An enrollment grants lifetime access to that course's non-preview lessons.
- **FR-13** Duplicate purchase of an already-enrolled course is prevented.

### Video & learning

- **FR-14** Enrolled (or preview) lessons play in a modern player supporting: keyboard
  shortcuts, fullscreen, and seek.
- **FR-15** Playback position is saved per lesson (`positionSeconds`, posted ~every
  10–15s); reopening a lesson resumes at the saved second.
- **FR-16** A lesson auto-marks **complete at ≥95% watched** — the completion is
  **server-derived** and **sticky** (once complete it never un-completes); course progress =
  completed lessons ÷ total lessons.
- **FR-17** Video is served from a short-lived signed URL minted per request, gated on
  enrollment (preview lessons excepted).
- **FR-25** A logged-out visitor can watch a course's free **preview lesson** in a dedicated
  anonymous preview player at `/courses/:slug/preview/:lessonId` (no login, no enrollment).

### Student dashboard

- **FR-18** Shows enrolled courses ("My Courses"), a "Continue Learning" entry pointing
  to the lesson to resume (the most-recently-watched incomplete lesson, else the first
  incomplete lesson in curriculum order), per-course progress %, and recently watched lessons.

### Admin dashboard

- **FR-19** Admin can create, edit, and delete courses (incl. price, thumbnail,
  instructor, description).
- **FR-20** Admin can create sections within a course and lessons within a section,
  set lesson order, and flag lessons as preview.
- **FR-21** Admin can upload a lesson video; the file uploads **directly to R2** via a
  presigned PUT (the API never proxies video bytes).
- **FR-22** Admin can list students, view a student's enrollments, toggle their role,
  and deactivate an account (blocks login). Admin cannot set passwords or manually grant
  course access.
- **FR-23** Admin can view all enrollments (who bought what, when).

## Non-Functional Requirements

### Security (top priority)

- **NFR-1** All mutating endpoints require an authenticated session; management endpoints
  additionally require `role === admin` (enforced server-side, never trusted from client).
- **NFR-2** Payment integrity: enrollment cannot be forged client-side; webhook signature
  is verified; Stripe amount/currency are validated against the course record.
- **NFR-3** Content protection: no paid video has a public, guessable, or long-lived URL;
  signed URLs are minted per request and expire (**~1 h TTL** — long enough to watch a lesson
  without a mid-playback expiry on a native `<video>` player, which keeps issuing range requests
  as it buffers/seeks; the per-request enrollment check at mint time is the real access control).
- **NFR-4** All request input is validated/sanitized server-side (schema validation) before
  use; reject on failure.
- **NFR-5** Secrets (Stripe keys, R2 keys, session secret, DB URI) live only in environment
  config, never in the repo or client bundle.
- **NFR-6** Standard hardening: rate limiting on auth endpoints, security headers (helmet),
  CORS locked to the known frontend origin.

### Performance & availability

- **NFR-7** The deployed site is usable with no local setup, on desktop and mobile
  (responsive).
- **NFR-8** No cold-start delay in normal operation (the always-on API host does not sleep).
- **NFR-9** Public pages render quickly (CDN-served frontend; course list is a single
  indexed query).

### Maintainability

- **NFR-10** Clear separation of concerns (routes / controllers / services / models);
  config via environment; documented in these spec docs so decisions are easy to reason about.

## Open Questions (deferred, tracked in 07-plan)

- Exact keyboard-shortcut set and whether speed/PiP/subtitles (optional FR-14 extras) make
  the cut — decided during implementation.
- Whether HLS/multi-quality (out of scope per Overview) is attempted as a stretch.

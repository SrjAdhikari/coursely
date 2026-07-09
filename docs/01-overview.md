---
status: approved
version: 1.3
date: 2026-07-09
---

# 01 - Overview

## Purpose & Vision

Coursely is a course-selling platform in the style of Udemy: visitors discover courses
publicly, pay once per course, and gain lifetime access to that course's video lessons
with progress tracking and resume playback.

The design priority is **defensible judgment over feature volume**: a small, secure,
focused system whose every decision is deliberate and documented, rather than a large system
that cannot be justified.

## Problem & Context

Learners need a single place to find a course, pay for it, and watch its content without
losing their place. Operators need to publish courses and control who can watch paid
content. The hard parts are not the ordinary add/edit/delete screens - they are: making paid video content
genuinely access-controlled (not a public URL), verifying payments so enrollment cannot
be forged, and delivering video without a large bandwidth bill.

## Target Users & Roles

Exactly two roles in v1:

- **Student** - browses public pages, purchases courses via Stripe, watches enrolled
  content, and resumes where they left off.
- **Admin** - a single platform-owner role. Owns and manages **all** courses on the
  platform (there is no per-course ownership and no separate "instructor" role). Creates
  and edits courses, sections, and lessons, uploads video, manages students, and views
  enrollments.

Authorization is therefore role-based only: `role === "admin"` grants full management
access. No per-resource ownership checks are required.

## Goals & Success Criteria

1. **Live & usable** - a real user can browse, register, log in, preview, purchase, and
   watch, entirely on the deployed site with no local setup.
2. **Secure** - payment verification, access control, and content protection are
   demonstrably designed, not bolted on. (The top priority.)
3. **Well-documented** - every architectural, database, auth, payment, and storage decision
   is written down with its rationale and trade-offs.

## Scope

### In scope (v1)

- Public homepage, public course pages with free preview lessons.
- Auth: signup, login, logout, protected routes, role-based access (Student / Admin).
- One-time, **per-course** purchase via Stripe Checkout (test mode); lifetime access on
  successful, verified payment.
- Student dashboard: my courses, continue learning, progress, recently watched.
- Admin dashboard: CRUD for courses / sections / lessons, video upload, student
  management, enrollment view.
- Self-hosted video: MP4 stored in Cloudflare R2, served via short-lived signed URLs,
  gated on enrollment (preview lessons excepted).
- Seed content: **3 courses** (HTML, CSS, JavaScript), **≥5 lessons each**, with 2-3
  preview lessons per course.

### Out of scope (v1 non-goals)

Each is deferred, not forgotten:

- **HLS / adaptive streaming & multi-quality transcode** - deferred; the video
  requirements are met by MP4 + signed URLs. A possible future enhancement.
- **Async/server-side video transcoding** - deferred; content is static and small, so
  video is served as-is. Admin upload stores the raw MP4.
- **Multiple admins / instructor ownership** - out; single platform-owner model chosen.
- **Reviews & ratings, certificates, coupons/discounts, refunds, subscriptions** - out;
  each adds payment/data complexity without proportionate value in v1.

## Pricing Model

One-time purchase, **per course**, lifetime access. Each course carries its own price
(a field on the course). There is no fully-free course; instead, 2-3 lessons per course
are flagged as free **preview** lessons, publicly playable without enrollment. All
enrollments flow through Stripe Checkout - there is no separate free-enrollment path.

## Key Constraints

- **Operational simplicity:** managed services over self-managed infrastructure -
  minimize undifferentiated ops and hardening work.
- **Maintainability:** every layer is straightforward to reason about and operate.

## Audience

- **End learners** - students who browse, buy, and watch courses.
- **Platform operator (Admin)** - publishes and manages the catalog and students.
- **Engineering** - owns the system and must be able to defend every decision.

## Design Rationale - key decisions & why

Each decision below shows **what we chose, why we chose it, and the option we turned down.**

### One admin who manages everything (no separate instructor accounts)
- **Choice.** There is a single kind of manager account - an admin - and it can manage every course. There are no separate instructor accounts that each own their own courses.
- **Why.** With one admin, the access rule stays simple: you are either the admin or you are not. We never have to check, on every action, whether *this* person owns *this* course - so there is less code and fewer chances to get an access check wrong.
- **Alternative rejected.** Letting many instructors each own their own courses. That would force an "is this yours?" check on every action, which is more complexity than a first version with a single owner needs.

### Free preview lessons instead of free courses
- **Choice.** A few lessons in each course (2-3) are free to watch as a preview. No course is completely free, and there is no way to enroll without paying.
- **Why.** People can try part of a course before buying, but every purchase still goes through the same Stripe checkout - so there is only **one** way to get access (by paying), which is much easier to keep secure.
- **Alternative rejected.** Offering fully-free courses, or a separate "free sign-up" path. That would be a second way to grant access that we would also have to build, protect, and test.

### Some features are postponed on purpose (not forgotten)
- **Choice.** Video plays as plain MP4 files. Bigger extras - automatic video-quality switching, reviews and ratings, certificates, coupons, and refunds - are postponed, not cancelled.
- **Why.** Plain MP4 already does everything the video needs to do, and each postponed feature adds real complexity around payments, data, or storage that is not worth it in a first version.

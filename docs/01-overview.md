---
status: approved
version: 1.1
date: 2026-06-23
---

# 01 — Overview

## Purpose & Vision

Coursely is a course-selling platform in the style of Udemy: visitors discover courses
publicly, pay once per course, and gain lifetime access to that course's video lessons
with progress tracking and resume playback. This v1 is the submission for the **VeoLMS**
core-team selection challenge — a production-like LMS (branded **Coursely**) built to
demonstrate the design, build, deploy, secure, test, and explain skills the challenge
evaluates, in service of contributing to the open-source **VeoLMS** project.

The design priority is **defensible judgment over feature volume**: a small, secure,
cost-efficient system whose every decision can be explained, rather than a large system
that cannot be justified.

## Problem & Context

Learners need a single place to find a course, pay for it, and watch its content without
losing their place. Operators need to publish courses and control who can watch paid
content. The hard parts are not the CRUD screens — they are: making paid video content
genuinely access-controlled (not a public URL), verifying payments so enrollment cannot
be forged, and delivering video without a large bandwidth bill.

## Target Users & Roles

Exactly two roles in v1:

- **Student** — browses public pages, purchases courses via Stripe, watches enrolled
  content, and resumes where they left off.
- **Admin** — a single platform-owner role. Owns and manages **all** courses on the
  platform (there is no per-course ownership and no separate "instructor" role). Creates
  and edits courses, sections, and lessons, uploads video, manages students, and views
  enrollments.

Authorization is therefore role-based only: `role === "admin"` grants full management
access. No per-resource ownership checks are required.

## Goals & Success Criteria

Success is defined by the challenge's evaluation bar:

1. **Live & usable** — a real user can browse, register, log in, preview, purchase, and
   watch, entirely on the deployed site with no local setup.
2. **Secure** — payment verification, access control, and content protection are
   demonstrably designed, not bolted on. (Heaviest-weighted criterion.)
3. **Cost-efficient** — target operating cost ≈ ₹600/month, with the architecture's cost
   trade-offs written down and justified.
4. **Explainable** — every architectural, database, auth, payment, and storage decision
   can be defended in a technical discussion.

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
- Seed content: **3 courses** (HTML, CSS, JavaScript), **≥5 lessons each**, with 2–3
  preview lessons per course. Video sourced from public YouTube content, downloaded and
  re-hosted.

### Out of scope (v1 non-goals)

Each is deferred, not forgotten:

- **HLS / adaptive streaming & multi-quality transcode** — deferred; mandatory video
  requirements are met by MP4 + signed URLs. Unblocks as a bonus if time remains.
- **Async/server-side video transcoding** — deferred; content is static and small, so
  video is served as-is. Admin upload stores the raw MP4.
- **Multiple admins / instructor ownership** — out; single platform-owner model chosen.
- **Reviews & ratings, certificates, coupons/discounts, refunds, subscriptions** — out;
  not required by the brief and each adds payment/data complexity without scoring value.

## Pricing Model

One-time purchase, **per course**, lifetime access. Each course carries its own price
(a field on the course). There is no fully-free course; instead, 2–3 lessons per course
are flagged as free **preview** lessons, publicly playable without enrollment. All
enrollments flow through Stripe Checkout — there is no separate free-enrollment path.

## Key Constraints

- **Time:** ~3 weeks to the 15 Jul 2026 deadline; full weekend availability, ~2–3
  weekday hours. Drives mandatory-first sequencing and managed services over self-managed
  infrastructure.
- **Cost ceiling:** ≈ ₹600/month. Drives zero-egress video storage and free-tier
  managed services.
- **Solo developer**, must be able to explain every layer unaided.

## Stakeholders

- **Evaluator / project owner** (procodrr) — primary audience; judges the submission and
  conducts the technical call.
- **End learners** — future users of the open-source platform.
- **Developer** (submitter) — owns and must defend all decisions.

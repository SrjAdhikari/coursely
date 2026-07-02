# Spec Docs — Coursely

| #   | Document                                  | Purpose                                                   | Status          |
| --- | ----------------------------------------- | --------------------------------------------------------- | --------------- |
| 01  | [Overview](01-overview.md)                | Why it exists, who it's for, scope, success criteria      | approved (v1.1) |
| 02  | [Requirements](02-requirements.md)        | Functional + non-functional (security, cost, performance) | approved (v1.2) |
| 03  | [Architecture](03-architecture.md)        | Tech stack, components, data flow, decisions & trade-offs | approved (v1.1) |
| 04  | [Data Model](04-data-model.md)            | Collections, fields, relationships, indexes               | approved (v1.3) |
| 05  | [API](05-api.md)                          | Endpoints, contracts, per-route auth & RBAC matrix        | approved (v1.4) |
| 06  | [Security / Threat Model](06-security.md) | STRIDE threats + mitigations                              | approved        |
| 07  | [Implementation Plan](07-plan.md)         | Sequenced build order, milestones, open questions         | approved (v1.2) |

## Feature reference (as-built)

Endpoint docs written from the shipped code; the full as-built index lives in [README](README.md).
The payments + enrollment set is linked here for discoverability.

| Area       | Endpoint                              | Document                                                       | Purpose                                                     |
| ---------- | ------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| Payments   | `POST /api/checkout`                  | [Checkout Session](payments/checkout-session.md)              | Create a Stripe Checkout session for a published course.   |
| Payments   | `POST /api/webhooks/stripe`           | [Stripe Webhook](payments/stripe-webhook.md)                  | Signature-verified, idempotent enrollment fulfillment.     |
| Payments   | `GET /api/checkout/:sessionId/status` | [Checkout Reconciliation](payments/checkout-reconciliation.md) | Success-page backstop; confirms payment with Stripe.      |
| Enrollment | `GET /api/enrollments/me`             | [My Courses (Student)](enrollment/my-courses.md)             | A student lists their own enrollments (caller-scoped).      |
| Enrollment | `GET /api/admin/enrollments`          | [Admin Enrollment Listing](enrollment/admin-enrollments.md) | Paginated admin list of every enrollment across students.  |

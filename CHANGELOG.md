# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-07-25

### Added

- Email verification for new sign-ups: a new account is emailed a verification link and must confirm it before signing in.
- Self-service password reset: a "Forgot password?" link on the login page emails a secure link to set a new password.
- A resend option for the verification email — on both the after-sign-up screen and the login page — so an expired or mislaid link is easy to recover from.

### Changed

- Signing up no longer logs you straight in; you're shown a "check your inbox" screen and asked to verify your email first. Signing in with Google is unaffected, as those accounts are already verified.

### Security

- Signing in now requires a verified email address.
- Verification and password-reset links are single-use and expire on their own — 24 hours for verification, one hour for a reset — and are stored only as hashes.
- Completing a password reset signs out every existing session for that account.
- The sign-up, resend-verification and forgot-password screens all answer the same way whether or not an account exists, so accounts can't be discovered by probing — and a temporary email-delivery problem doesn't change that answer.

## [1.1.0] - 2026-07-19

### Added

- Sign in with Google on both the login and sign-up pages, with a first-time sign-in creating the account automatically.
- Google profile pictures now appear in the account menu, falling back to initials when no picture is available.

### Changed

- The product is now called **Manakuru**. New logo and wordmark across the marketing site, storefront, admin console and auth pages.
- New favicon set and a web app manifest, so the site installs and pins with proper branding.
- Headings now use the Space Grotesk typeface; body text continues to use JetBrains Mono.
- Refreshed search and social metadata: page titles and descriptions, Open Graph and structured data, a social share image, plus `robots.txt` and a sitemap.

## [1.0.0] - 2026-07-17

First release: a full learning platform where anyone can browse a course catalog, preview
lessons for free, buy a course, and then learn in a player that remembers where they left off —
with an admin console behind it for running the whole catalog.

### Added

- Email-and-password sign-up, login and logout, backed by server-side sessions in a signed, http-only cookie that can be revoked the moment someone logs out.
- Student and Admin roles, enforced both by route guards in the browser and by checks on the server; new accounts are always created as students.
- Sessions expire on their own, and when one is no longer valid the browser is sent to the login page and returned to the exact page it left afterwards.
- Courses with a title, description, instructor, price, category, learning outcomes, thumbnail, and a draft or published state.
- A curriculum built from ordered sections and lessons, each lesson carrying its own video, duration and optional free-preview flag.
- Lesson counts and total course length are worked out when a course is read rather than stored, so they can never fall out of step with the curriculum.
- Deleting a course or a section removes its children in a single transaction, and a course that already has students enrolled cannot be deleted at all.
- An admin console with sidebar navigation, a theme toggle, and an overview showing course, student, enrollment and revenue totals.
- A two-step course authoring flow: fill in the details, then build out the curriculum with section and lesson dialogs on a dedicated build page.
- Student management for admins — a paginated list, a detail view showing that student's real enrollments, and the ability to deactivate an account.
- A paginated view of every enrollment across the catalog.
- Courses cannot be published until every lesson actually has a video attached.
- Video uploads go straight from the browser to private storage using a short-lived signed link, so large files never pass through the API.
- Playback links are minted one request at a time and only after an enrollment, free-preview or admin check; the underlying storage keys never leave the server.
- Course trailers and thumbnails upload the same way; the trailer plays in a lightbox on the public course page and is open to visitors without an account.
- A custom video player with play and pause, seeking and skip, volume, playback speed, fullscreen, a poster frame, keyboard shortcuts and an on-screen shortcut hint.
- Stripe hosted checkout, with dedicated success and cancel pages.
- Enrollment is only ever written by Stripe's signature-verified webhook, and the amount paid is checked against a price snapshot taken at checkout.
- Enrollments are idempotent, so a repeated or replayed payment event can never create a duplicate purchase, and no purchase can be forged from the browser.
- A checkout status check, scoped to the buyer's own session, that reconciles a payment if the webhook is delayed.
- A learn page pairing the player with the course curriculum, showing per-lesson completion and overall course progress, and moving on to the next lesson when a video ends.
- Watch position is saved as you go and picked up again on your next visit, returning you to the lesson you were last actually watching.
- Completion is worked out on the server at 95 percent watched and stays complete once reached, so it cannot be faked from the browser.
- A student dashboard with an overall progress ring, active and finished course counts, a Continue Learning card, per-course progress and a Recently Watched list.
- A My Courses page listing everything a student owns, linking straight back into the player.
- A marketing homepage with a hero and catalog search, featured courses, value propositions, an interactive product showcase, a how-it-works walkthrough, an FAQ, scroll-spy navigation and a mobile menu.
- A public catalog with debounced search and category filtering, and public course pages with the full curriculum, trailer and playable free-preview lessons.
- A dark-first responsive design system shared across the marketing site, storefront and admin console, plus a branded loading state and a proper 404 page.
- A REST API under `/api` with schema validation on every route and one consistent error shape across the whole surface.
- Database-level schema validators as a backstop behind the application checks, plus scripts to apply them and to seed an admin account.
- Continuous integration running lint, type checks, builds and tests for both packages on every push and pull request.
- Automated test suites in both packages, including API tests running against an in-memory database.

### Security

- Rate limiting is keyed on the real connection address rather than a header a caller can spoof, with separate allowances for payments, checkout status and webhook traffic.
- Session tokens are long random values stored only as hashes, and the cookie signing secret must be at least 32 characters.
- Registration always answers the same way whether or not the email is already in use, so accounts cannot be discovered by probing the sign-up form.
- Free-text input on courses and account names is sanitized, and sign-up names are checked for shape and capped in length.
- State-changing requests from a logged-in session must carry a matching Origin or Referer; anything without one is refused before it reaches a handler.
- The email pattern was rewritten to a linear one to remove a denial-of-service risk from catastrophic backtracking, with the database validator kept in step.
- Baseline hardening throughout: bcrypt password hashing, a session-fixation defence on login, security headers with an explicit content security policy, and a build dependency upgrade to close a published development-server advisory.

### Fixed

- Resuming a course returns to the lesson you last watched rather than the first unfinished one.
- Leaving the player no longer overwrites saved progress with a zero position.
- The admin overview reads real enrollment and revenue figures, and flags revenue as a partial total when there is more data than one fetch returns.
- The admin student detail page shows a student's actual enrollments instead of placeholder rows.
- The player keeps its keyboard shortcuts after the centre play button is clicked, and recovers from a failed video load instead of spinning forever.
- Page headers no longer shift as the scrollbar appears or the account menu opens.

[Unreleased]: https://github.com/SrjAdhikari/coursely/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/SrjAdhikari/coursely/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/SrjAdhikari/coursely/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/SrjAdhikari/coursely/releases/tag/v1.0.0

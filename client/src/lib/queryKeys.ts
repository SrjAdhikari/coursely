//* src/lib/queryKeys.ts

/**
 * Shared React Query keys. Kept dependency-free so both `config/axiosClient`
 * (the eviction interceptor) and `hooks/useAuth` can import the key without an
 * import cycle, and so the literal never drifts across call sites.
 */

/** Current authenticated user. */
export const CURRENT_USER_KEY = ["currentUser"] as const;

/** Admin courses list + per-course detail (curriculum). */
export const COURSES_KEY = ["courses"] as const;
export const courseKey = (id: string) => ["courses", id] as const;

/** Admin students list + per-student detail. */
export const STUDENTS_KEY = ["students"] as const;
export const studentKey = (id: string) => ["students", id] as const;

/** Per-lesson signed playback URL (short-lived; never persisted). */
export const lessonPlaybackKey = (id: string) => ["lessonPlayback", id] as const;

/** Public catalog list + per-slug detail. */
export const CATALOG_KEY = ["catalog"] as const;
export const courseSlugKey = (slug: string) =>
	["catalog", "slug", slug] as const;

/** The current student's own enrollments (My Courses). */
export const MY_ENROLLMENTS_KEY = ["enrollments", "me"] as const;

/** Admin enrollments page (paginated). */
export const adminEnrollmentsKey = (page: number, limit: number) =>
	["adminEnrollments", page, limit] as const;

/** Reconciled checkout status for a session (success page). */
export const checkoutStatusKey = (sessionId: string) =>
	["checkoutStatus", sessionId] as const;

/** The caller's own progress rows for a course (LearnPage resume + sidebar). */
export const courseProgressKey = (courseId: string) =>
	["progress", "course", courseId] as const;

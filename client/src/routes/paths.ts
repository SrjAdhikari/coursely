//* src/routes/paths.ts

/**
 * Centralized route paths.
 */
const ROUTES = {
	ROOT: "/",

	// Public
	LOGIN: "/login",
	REGISTER: "/signup",
	VERIFY_EMAIL: "/verify-email",
	FORGOT_PASSWORD: "/forgot-password",
	RESET_PASSWORD: "/reset-password",
	CATALOG: "/courses",
	COURSE_DETAIL: (slug: string) => `/courses/${slug}`,
	COURSE_PREVIEW: (slug: string, lessonId: string) =>
		`/courses/${slug}/preview/${lessonId}`,

	// Authenticated
	DASHBOARD: "/dashboard",
	CHECKOUT_SUCCESS: "/checkout/success",
	CHECKOUT_CANCEL: "/checkout/cancel",
	MY_COURSES: "/my-courses",
	LEARN: (slug: string) => `/learn/${slug}`,
	LEARN_LESSON: (slug: string, lessonId: string) =>
		`/learn/${slug}/${lessonId}`,

	// Admin
	ADMIN: "/admin",
	ADMIN_COURSES: "/admin/courses",
	ADMIN_COURSE_NEW: "/admin/courses/new",
	ADMIN_STUDENTS: "/admin/students",
	ADMIN_ENROLLMENTS: "/admin/enrollments",

	adminCourseEdit: (id: string) => `/admin/courses/${id}/edit`,
	adminCourseCurriculum: (id: string) => `/admin/courses/${id}/curriculum`,
	adminStudent: (id: string) => `/admin/students/${id}`,
} as const;

export default ROUTES;

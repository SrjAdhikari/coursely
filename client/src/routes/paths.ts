//* src/routes/paths.ts

/**
 * Centralized route paths.
 */
const ROUTES = {
	ROOT: "/",

	// Public
	LOGIN: "/login",
	REGISTER: "/signup",
	CATALOG: "/courses",

	// Authenticated
	DASHBOARD: "/dashboard",

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

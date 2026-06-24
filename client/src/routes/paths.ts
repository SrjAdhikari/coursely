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
} as const;

export default ROUTES;

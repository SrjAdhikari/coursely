//* src/constants/appErrorCode.ts

/**
 * Centralized application error codes. Extended per phase as features land.
 */
const appErrorCode = Object.freeze({
	// General
	ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",
	INTERNAL_ERROR: "INTERNAL_ERROR",
	RATE_LIMITED: "RATE_LIMITED",

	// Validation
	VALIDATION_ERROR: "VALIDATION_ERROR",

	// Auth
	UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
	INSUFFICIENT_ROLE: "INSUFFICIENT_ROLE",
});

export default appErrorCode;

//* src/constants/appErrorCode.ts

/**
 * Centralized application error codes.
 * 
 * @readonly
 * @enum {string}
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
	INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
	USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
	ACCOUNT_DEACTIVATED: "ACCOUNT_DEACTIVATED",
});

export default appErrorCode;

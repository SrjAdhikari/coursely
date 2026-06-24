//* src/types/api.types.ts

/**
 * Shared types for API communication.
 * These mirror the backend's response format from the global error middleware.
 */

/**
 * Shape of success responses from controllers
 */
export interface ApiSuccessResponse<T = undefined> {
	success: true;
	message: string;
	data: T;
}

/**
 * Structured error envelope returned by the Coursely API.                
 * Mirrors the backend shape: { status, error: { code, message } }.       
 */
export interface ApiErrorResponse {
	status: "fail" | "error";
	error: {
		code: string;
		message: string;
	};
}

/**
 * Normalized client-side error — the predictable { code, message } object
 * every catch block and React Query error handler receives.
 */
export interface ApiError {
	message: string;
	code: string;
}

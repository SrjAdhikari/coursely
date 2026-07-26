//* src/api/auth.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	UserPayload,
	RegisterPayload,
	LoginPayload,
	GoogleSignInPayload,
	VerifyEmailPayload,
	ResendVerificationPayload,
	ForgotPasswordPayload,
	ResetPasswordPayload,
} from "@/types/auth.types";

/**
 * Fetches the currently authenticated user. The single source of auth truth —
 * register/login don't return the user, the client reads it from here.
 */
const getCurrentUser = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<UserPayload>>("/auth/me");
	return data;
};

/** Registers a new student account. */
const register = async (payload: RegisterPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/register",
		payload,
	);
	return data;
};

/** Logs in with email + password. */
const login = async (payload: LoginPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/login",
		payload,
	);
	return data;
};

/** Logs out the current session (clears the cookie, deletes it server-side). */
const logout = async () => {
	const { data } = await axiosClient.post<ApiSuccessResponse>("/auth/logout");
	return data;
};

/** Signs in (or up) with a Google ID token; the server sets the session cookie. */
const signInWithGoogle = async (payload: GoogleSignInPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/google",
		payload,
	);
	return data;
};

/** Confirms an email address from a verification link's token. */
const verifyEmail = async (payload: VerifyEmailPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/verify-email",
		payload,
	);
	return data;
};

/** Requests a fresh verification link. */
const resendVerification = async (payload: ResendVerificationPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/resend-verification",
		payload,
	);
	return data;
};

/** Requests a password-reset link. */
const forgotPassword = async (payload: ForgotPasswordPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/forgot-password",
		payload,
	);
	return data;
};

/** Sets a new password from a reset link's token. */
const resetPassword = async (payload: ResetPasswordPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/reset-password",
		payload,
	);
	return data;
};

export {
	getCurrentUser,
	register,
	login,
	logout,
	signInWithGoogle,
	verifyEmail,
	resendVerification,
	forgotPassword,
	resetPassword,
};

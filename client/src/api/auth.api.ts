//* src/api/auth.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	UserPayload,
	RegisterPayload,
	LoginPayload,
	GoogleSignInPayload,
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

export { getCurrentUser, register, login, logout, signInWithGoogle };

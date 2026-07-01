//* src/config/axiosClient.ts

/**
 * Central Axios instance — all API calls go through this.
 * `withCredentials: true` sends the signed httpOnly session cookie on every
 * request (required for the cookie-based auth).
 */

import axios, { type AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/constants";
import normalizeError from "@/lib/normalizeError";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";
import queryClient from "@/config/queryClient";
import ROUTES from "@/routes/paths";

if (!API_BASE_URL) {
	throw new Error("VITE_API_URL is not defined in the environment variables");
}

const axiosClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

/**
 * Server error codes meaning "this session can no longer act". When one of
 * these arrives mid-session, drop the cached user and bounce to login.
 */
const EVICTION_CODES = new Set(["UNAUTHORIZED_ACCESS", "ACCOUNT_DEACTIVATED"]);

/**
 * Pages that render fine while logged out — a 401 here must NOT hard-redirect;
 * the route guards own the logged-out case with a soft <Navigate>.
 */
const PUBLIC_PATHS = new Set<string>([
	ROUTES.ROOT,
	ROUTES.LOGIN,
	ROUTES.REGISTER,
	ROUTES.CATALOG,
]);

/**
 * Public pages render fine while logged out. The catalog and any course detail
 * (`/courses/...`) are public, so a 401 there must NOT hard-redirect.
 */
const isPublicPath = (pathname: string): boolean =>
	PUBLIC_PATHS.has(pathname) || pathname.startsWith(`${ROUTES.CATALOG}/`);

/**
 * Response interceptor — funnels every error through normalizeError so each
 * catch block receives the same predictable { code, message } shape, and on a
 * session-eviction code (outside the /auth/me probe and public pages) clears
 * the cached user and redirects to login so an expired/deactivated session
 * cannot linger on a protected page.
 */
axiosClient.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		const normalized = normalizeError(error);
		const requestUrl = error.config?.url ?? "";
		const isAuthProbe = requestUrl.endsWith("/auth/me");

		if (
			!isAuthProbe &&
			EVICTION_CODES.has(normalized.code) &&
			!isPublicPath(window.location.pathname)
		) {
			queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
			// Preserve where the user was so login can return them there.
			const returnTo = encodeURIComponent(
				`${window.location.pathname}${window.location.search}`,
			);
			window.location.href = `${ROUTES.LOGIN}?redirect=${returnTo}`;
		}

		return Promise.reject(normalized);
	},
);

export default axiosClient;

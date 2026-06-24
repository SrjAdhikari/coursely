//* src/config/axiosClient.ts

/**
 * Central Axios instance — all API calls go through this.
 * `withCredentials: true` sends the signed httpOnly session cookie on every
 * request (required for the cookie-based auth).
 */

import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";
import normalizeError from "@/lib/normalizeError";

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
 * Response interceptor — funnels every error through normalizeError so each
 * catch block receives the same predictable { code, message } shape.
 */
axiosClient.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(normalizeError(error)),
);

export default axiosClient;

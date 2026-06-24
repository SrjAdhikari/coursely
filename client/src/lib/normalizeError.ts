//* src/lib/normalizeError.ts

import { AxiosError } from "axios";
import type { ApiError, ApiErrorResponse } from "@/types/api.types";

/**
 * Extracts a consistent { code, message } error from an unknown thrown value.
 * If the backend returned a structured error envelope, pulls out its code and
 * message; otherwise falls back to a generic network error.
 */
const normalizeError = (error: unknown): ApiError => {
	if (error instanceof AxiosError && error.response) {
		const data = error.response.data as ApiErrorResponse;

		if (data?.error?.message) {
			return {
				code: data.error.code,
				message: data.error.message,
			};
		}
	}

	return {
		code: "NETWORK_ERROR",
		message: "Something went wrong. Please try again.",
	};
};

export default normalizeError;

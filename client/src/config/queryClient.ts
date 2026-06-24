//* src/config/queryClient.ts

import { QueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/types/api.types";

/**
 * Register ApiError as the default error type so `error.code` is typed on
 * every query and mutation result (replaces React Query's default `Error`).
 */
declare module "@tanstack/react-query" {
	interface Register {
		defaultError: ApiError;
	}
}

/**
 * Shared TanStack Query client used by the QueryClientProvider in main.tsx.
 * - retry: false — surface errors explicitly rather than silently retrying.
 * - refetchOnWindowFocus: false — avoid surprise refetches on tab switches.
 */
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: false,
		},
	},
});

export default queryClient;

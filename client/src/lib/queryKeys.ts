//* src/lib/queryKeys.ts

/**
 * Shared React Query keys. Kept dependency-free so both `config/axiosClient`
 * (the eviction interceptor) and `hooks/useAuth` can import the key without an
 * import cycle, and so the literal never drifts across call sites.
 */
export const CURRENT_USER_KEY = ["currentUser"] as const;

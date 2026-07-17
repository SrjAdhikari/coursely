//* src/hooks/useAuth.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	getCurrentUser,
	register,
	login,
	logout,
	signInWithGoogle,
} from "@/api/auth.api";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";

/**
 * Query hook for the current authenticated user — the single source of auth
 * truth that drives the route guards. Fetched once (`staleTime: Infinity`) and
 * only refetched when explicitly invalidated after login/logout; a 401 resolves
 * to `isError` rather than retrying.
 */
const useCurrentUser = () => {
	return useQuery({
		queryKey: CURRENT_USER_KEY,
		queryFn: getCurrentUser,
		retry: false,
		staleTime: Infinity,
	});
};

/** Mutation hook for registering a new account. */
const useRegister = () => {
	return useMutation({ mutationFn: register });
};

/** Mutation hook for logging in. */
const useLogin = () => {
	return useMutation({ mutationFn: login });
};

/** Mutation hook for logging out the current session. */
const useLogout = () => {
	return useMutation({ mutationFn: logout });
};

/** Mutation hook for signing in with Google. */
const useGoogleSignIn = () => {
	return useMutation({ mutationFn: signInWithGoogle });
};

export { useCurrentUser, useRegister, useLogin, useLogout, useGoogleSignIn };

//* src/hooks/useAuth.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	getCurrentUser,
	register,
	login,
	logout,
	signInWithGoogle,
	verifyEmail,
	resendVerification,
	forgotPassword,
	resetPassword,
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

/** Mutation hook for confirming an email from a verification link. */
const useVerifyEmail = () => {
	return useMutation({ mutationFn: verifyEmail });
};

/** Mutation hook for requesting a fresh verification link. */
const useResendVerification = () => {
	return useMutation({ mutationFn: resendVerification });
};

/** Mutation hook for requesting a password-reset link. */
const useForgotPassword = () => {
	return useMutation({ mutationFn: forgotPassword });
};

/** Mutation hook for setting a new password from a reset link. */
const useResetPassword = () => {
	return useMutation({ mutationFn: resetPassword });
};

export {
	useCurrentUser,
	useRegister,
	useLogin,
	useLogout,
	useGoogleSignIn,
	useVerifyEmail,
	useResendVerification,
	useForgotPassword,
	useResetPassword,
};

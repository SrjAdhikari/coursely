//* test/hooks/useAuth.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/auth.api", () => ({
	getCurrentUser: vi.fn(),
	login: vi.fn(),
	register: vi.fn(),
	logout: vi.fn(),
	signInWithGoogle: vi.fn(),
	verifyEmail: vi.fn(),
	resendVerification: vi.fn(),
	forgotPassword: vi.fn(),
	resetPassword: vi.fn(),
}));

import {
	getCurrentUser,
	login,
	signInWithGoogle,
	verifyEmail,
	resendVerification,
	forgotPassword,
	resetPassword,
} from "@/api/auth.api";
import {
	useCurrentUser,
	useLogin,
	useGoogleSignIn,
	useVerifyEmail,
	useResendVerification,
	useForgotPassword,
	useResetPassword,
} from "@/hooks/useAuth";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("useAuth", () => {
	beforeEach(() => vi.clearAllMocks());

	describe("useCurrentUser", () => {
		it("returns the user fetched from /auth/me", async () => {
			vi.mocked(getCurrentUser).mockResolvedValue({
				success: true,
				message: "ok",
				data: { id: "1", name: "Asha", email: "asha@example.com", role: "student" },
			});

			const { result } = renderHook(() => useCurrentUser(), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(result.current.data?.data.email).toBe("asha@example.com");
		});
	});

	describe("useLogin", () => {
		it("calls the login api with the submitted credentials", async () => {
			vi.mocked(login).mockResolvedValue({
				success: true,
				message: "Logged in successfully",
				data: undefined,
			});

			const { result } = renderHook(() => useLogin(), { wrapper });
			result.current.mutate({ email: "asha@example.com", password: "Password1!" });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			// TanStack Query invokes the mutationFn as (variables, context).
			expect(login).toHaveBeenCalledWith(
				{ email: "asha@example.com", password: "Password1!" },
				expect.any(Object),
			);
		});
	});

	describe("useGoogleSignIn", () => {
		it("calls signInWithGoogle with the id token", async () => {
			vi.mocked(signInWithGoogle).mockResolvedValue({
				success: true,
				message: "Logged in successfully",
				data: undefined,
			});

			const { result } = renderHook(() => useGoogleSignIn(), { wrapper });
			result.current.mutate({ idToken: "google-id-token" });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(signInWithGoogle).toHaveBeenCalledWith(
				{ idToken: "google-id-token" },
				expect.any(Object),
			);
		});
	});

	describe("useVerifyEmail", () => {
		it("calls verifyEmail with the token payload", async () => {
			vi.mocked(verifyEmail).mockResolvedValue({
				success: true,
				message: "ok",
				data: undefined,
			});

			const { result } = renderHook(() => useVerifyEmail(), { wrapper });
			result.current.mutate({ token: "raw-token" });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(verifyEmail).toHaveBeenCalledWith(
				{ token: "raw-token" },
				expect.any(Object),
			);
		});
	});

	describe("useResendVerification", () => {
		it("calls resendVerification with the email payload", async () => {
			vi.mocked(resendVerification).mockResolvedValue({
				success: true,
				message: "ok",
				data: undefined,
			});

			const { result } = renderHook(() => useResendVerification(), { wrapper });
			result.current.mutate({ email: "asha@example.com" });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(resendVerification).toHaveBeenCalledWith(
				{ email: "asha@example.com" },
				expect.any(Object),
			);
		});
	});

	describe("useForgotPassword", () => {
		it("calls forgotPassword with the email payload", async () => {
			vi.mocked(forgotPassword).mockResolvedValue({
				success: true,
				message: "ok",
				data: undefined,
			});

			const { result } = renderHook(() => useForgotPassword(), { wrapper });
			result.current.mutate({ email: "asha@example.com" });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(forgotPassword).toHaveBeenCalledWith(
				{ email: "asha@example.com" },
				expect.any(Object),
			);
		});
	});

	describe("useResetPassword", () => {
		it("calls resetPassword with the token and new password", async () => {
			vi.mocked(resetPassword).mockResolvedValue({
				success: true,
				message: "ok",
				data: undefined,
			});

			const { result } = renderHook(() => useResetPassword(), { wrapper });
			result.current.mutate({ token: "raw-token", newPassword: "Password1!" });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(resetPassword).toHaveBeenCalledWith(
				{ token: "raw-token", newPassword: "Password1!" },
				expect.any(Object),
			);
		});
	});
});

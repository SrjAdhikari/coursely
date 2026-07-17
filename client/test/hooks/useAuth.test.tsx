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
}));

import { getCurrentUser, login, signInWithGoogle } from "@/api/auth.api";
import { useCurrentUser, useLogin, useGoogleSignIn } from "@/hooks/useAuth";

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
});

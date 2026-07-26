//* test/pages/VerifyEmailPage.strictmode.test.tsx
//
// Integration test for the StrictMode teardown bug. Unlike the unit test, this
// does NOT mock the hook — it uses the REAL useMutation so StrictMode's
// mount→unmount→remount actually exercises the observer/callback lifecycle.
// The verify API resolves on a later tick, so the first mount is torn down
// before the request settles — exactly the condition that hung the page.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const verifyEmailApi = vi.fn();
vi.mock("@/api/auth.api", () => ({
	verifyEmail: (...args: unknown[]) => verifyEmailApi(...args),
	resendVerification: vi.fn(),
}));

import VerifyEmailPage from "@/pages/VerifyEmailPage";

const renderUnderStrictMode = () => {
	const queryClient = new QueryClient({
		defaultOptions: { mutations: { retry: false } },
	});
	return render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<MemoryRouter initialEntries={["/verify-email?token=verify-token"]}>
					<VerifyEmailPage />
				</MemoryRouter>
			</QueryClientProvider>
		</StrictMode>,
	);
};

describe("VerifyEmailPage under StrictMode (real hook)", () => {
	beforeEach(() => vi.clearAllMocks());

	it("leaves the verifying state when the verify request settles later", async () => {
		// Resolve on a later tick — so StrictMode unmounts the first mount before
		// the request finishes (the drop condition).
		verifyEmailApi.mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(() => resolve({ success: true, message: "ok" }), 0),
				),
		);

		renderUnderStrictMode();

		expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
		// Must transition out of the spinner — the bug hung here forever.
		expect(await screen.findByText(/email verified/i)).toBeInTheDocument();
		// Single-use token: exactly one server call despite the double-mount.
		expect(verifyEmailApi).toHaveBeenCalledTimes(1);
	});
});

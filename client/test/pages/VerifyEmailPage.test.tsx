//* test/pages/VerifyEmailPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, Link } from "react-router";

const mockVerify = vi.fn();
const mockResend = vi.fn();
const mockStart = vi.fn();
// Hoisted so it exists before the sonner mock factory (external-module mocks
// register eagerly, ahead of these top-level consts).
const { mockToastSuccess } = vi.hoisted(() => ({ mockToastSuccess: vi.fn() }));
// Controlled so the cooldown branches are deterministic — the countdown ticking
// is covered by test/hooks/useCountdown.test.ts.
let mockSecondsLeft = 0;

vi.mock("@/hooks/useAuth", () => ({
	// Verify is driven by mutateAsync's promise (not mutate's per-call callbacks,
	// which StrictMode drops on unmount — the bug that hung the page on "verifying").
	useVerifyEmail: () => ({ mutateAsync: mockVerify }),
	useResendVerification: () => ({ mutate: mockResend, isPending: false }),
}));
vi.mock("@/hooks/useCountdown", () => ({
	default: () => ({ secondsLeft: mockSecondsLeft, start: mockStart }),
}));
vi.mock("sonner", () => ({
	toast: { success: mockToastSuccess, error: vi.fn() },
}));

import VerifyEmailPage from "@/pages/VerifyEmailPage";

const renderPage = (initialEntry = "/verify-email?token=verify-token") =>
	render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<VerifyEmailPage />
		</MemoryRouter>,
	);

const badTokenError = {
	message: "This verification link is invalid or has expired.",
	code: "INVALID_OR_EXPIRED_TOKEN",
};

describe("VerifyEmailPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSecondsLeft = 0;
	});

	it("posts the token once on mount and shows the verifying state", () => {
		mockVerify.mockReturnValue(new Promise(() => {}));
		renderPage();

		expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
		expect(mockVerify).toHaveBeenCalledTimes(1);
		expect(mockVerify).toHaveBeenCalledWith({ token: "verify-token" });
	});

	it("shows the success state with a login CTA when the verify promise resolves", async () => {
		mockVerify.mockResolvedValue(undefined);
		renderPage();

		expect(await screen.findByText(/email verified/i)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /go to log in/i })).toHaveAttribute(
			"href",
			"/login",
		);
	});

	it("shows the failure state with a resend action when the verify promise rejects", async () => {
		mockVerify.mockRejectedValue(badTokenError);
		renderPage();

		expect(
			await screen.findByText(/invalid or has expired/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /resend verification email/i }),
		).toBeInTheDocument();
	});

	it("toasts and starts the 60s cooldown on a successful resend", async () => {
		mockVerify.mockRejectedValue(badTokenError);
		mockResend.mockImplementation((_payload, options) => options.onSuccess());
		const user = userEvent.setup();
		renderPage();

		await user.type(
			await screen.findByLabelText(/email/i),
			"asha@example.com",
		);
		await user.click(
			screen.getByRole("button", { name: /resend verification email/i }),
		);

		expect(mockResend).toHaveBeenCalledWith(
			{ email: "asha@example.com" },
			expect.any(Object),
		);
		expect(mockToastSuccess).toHaveBeenCalledWith("Verification email sent");
		expect(mockStart).toHaveBeenCalledWith(60);
	});

	it("disables the resend button with a countdown while on cooldown", async () => {
		mockSecondsLeft = 45;
		mockVerify.mockRejectedValue(badTokenError);
		renderPage();

		await screen.findByText(/invalid or has expired/i);
		expect(
			screen.getByRole("button", { name: /resend in 45s/i }),
		).toBeDisabled();
	});

	it("surfaces an error when the resend itself fails", async () => {
		mockVerify.mockRejectedValue(badTokenError);
		mockResend.mockImplementation((_payload, options) =>
			options.onError({
				message: "Too many requests. Please try again later.",
				code: "RATE_LIMITED",
			}),
		);
		const user = userEvent.setup();
		renderPage();

		await user.type(
			await screen.findByLabelText(/email/i),
			"asha@example.com",
		);
		await user.click(
			screen.getByRole("button", { name: /resend verification email/i }),
		);

		expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
	});

	it("re-verifies when the token in the URL changes while mounted", async () => {
		mockVerify.mockResolvedValue(undefined);
		const user = userEvent.setup();
		render(
			<MemoryRouter initialEntries={["/verify-email?token=token-a"]}>
				<Routes>
					<Route path="/verify-email" element={<VerifyEmailPage />} />
				</Routes>
				<Link to="/verify-email?token=token-b">switch-token</Link>
			</MemoryRouter>,
		);

		expect(await screen.findByText(/email verified/i)).toBeInTheDocument();
		expect(mockVerify).toHaveBeenCalledWith({ token: "token-a" });

		await user.click(screen.getByRole("link", { name: "switch-token" }));

		await waitFor(() =>
			expect(mockVerify).toHaveBeenCalledWith({ token: "token-b" }),
		);
		expect(mockVerify).toHaveBeenCalledTimes(2);
	});
});

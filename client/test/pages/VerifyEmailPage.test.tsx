//* test/pages/VerifyEmailPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

const mockVerify = vi.fn();
const mockResend = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useVerifyEmail: () => ({ mutate: mockVerify, isPending: false }),
	useResendVerification: () => ({ mutate: mockResend, isPending: false }),
}));

import VerifyEmailPage from "@/pages/VerifyEmailPage";

const renderPage = (initialEntry = "/verify-email?token=verify-token") =>
	render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<VerifyEmailPage />
		</MemoryRouter>,
	);

describe("VerifyEmailPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("posts the token once on mount and shows the verifying state", () => {
		renderPage();

		expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
		expect(mockVerify).toHaveBeenCalledTimes(1);
		expect(mockVerify).toHaveBeenCalledWith(
			{ token: "verify-token" },
			expect.any(Object),
		);
	});

	it("shows the success state with a login CTA when verification succeeds", async () => {
		mockVerify.mockImplementation((_payload, options) => options.onSuccess());
		renderPage();

		expect(await screen.findByText(/email verified/i)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /go to log in/i })).toHaveAttribute(
			"href",
			"/login",
		);
	});

	it("shows the failure state with a resend action when the token is bad", async () => {
		mockVerify.mockImplementation((_payload, options) =>
			options.onError({
				message: "This verification link is invalid or has expired.",
				code: "INVALID_OR_EXPIRED_TOKEN",
			}),
		);
		renderPage();

		expect(
			await screen.findByText(/invalid or has expired/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /resend verification email/i }),
		).toBeInTheDocument();
	});

	it("surfaces an error when the resend itself fails", async () => {
		mockVerify.mockImplementation((_payload, options) =>
			options.onError({
				message: "This verification link is invalid or has expired.",
				code: "INVALID_OR_EXPIRED_TOKEN",
			}),
		);
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
});

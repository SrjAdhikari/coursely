//* test/components/auth/EmailVerificationPrompt.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockResend = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useResendVerification: () => ({ mutate: mockResend, isPending: false }),
}));

import EmailVerificationPrompt from "@/components/auth/EmailVerificationPrompt";

describe("EmailVerificationPrompt", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows the sent-to email and a resend button", () => {
		render(<EmailVerificationPrompt email="asha@example.com" />);

		expect(screen.getByText("asha@example.com")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /resend verification email/i }),
		).toBeInTheDocument();
	});

	it("resends with the email and shows a neutral confirmation on success", async () => {
		mockResend.mockImplementation((_payload, options) => options.onSuccess());
		const user = userEvent.setup();
		render(<EmailVerificationPrompt email="asha@example.com" />);

		await user.click(
			screen.getByRole("button", { name: /resend verification email/i }),
		);

		expect(mockResend).toHaveBeenCalledWith(
			{ email: "asha@example.com" },
			expect.any(Object),
		);
		expect(screen.getByText(/a new link is on its way/i)).toBeInTheDocument();
	});

	it("surfaces an error when the resend fails", async () => {
		mockResend.mockImplementation((_payload, options) =>
			options.onError({
				message: "Too many requests. Please try again later.",
				code: "RATE_LIMITED",
			}),
		);
		const user = userEvent.setup();
		render(<EmailVerificationPrompt email="asha@example.com" />);

		await user.click(
			screen.getByRole("button", { name: /resend verification email/i }),
		);

		expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
		// The button stays available so the user can retry.
		expect(
			screen.getByRole("button", { name: /resend verification email/i }),
		).toBeInTheDocument();
	});
});

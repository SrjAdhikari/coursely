//* test/components/auth/EmailVerificationPrompt.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockResend = vi.fn();
const mockStart = vi.fn();
// Hoisted so it exists before the sonner mock factory (external-module mocks
// register eagerly, ahead of these top-level consts).
const { mockToastSuccess } = vi.hoisted(() => ({ mockToastSuccess: vi.fn() }));
// Controlled here so the cooldown label branches are deterministic — the real
// countdown ticking is covered by test/hooks/useCountdown.test.ts.
let mockSecondsLeft = 0;

vi.mock("@/hooks/useAuth", () => ({
	useResendVerification: () => ({ mutate: mockResend, isPending: false }),
}));
vi.mock("@/hooks/useCountdown", () => ({
	default: () => ({ secondsLeft: mockSecondsLeft, start: mockStart }),
}));
vi.mock("sonner", () => ({
	toast: { success: mockToastSuccess, error: vi.fn() },
}));

import EmailVerificationPrompt from "@/components/auth/EmailVerificationPrompt";

describe("EmailVerificationPrompt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSecondsLeft = 0;
	});

	it("shows the sent-to email and an enabled resend button when idle", () => {
		render(<EmailVerificationPrompt email="asha@example.com" />);

		expect(screen.getByText("asha@example.com")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /resend verification email/i }),
		).toBeEnabled();
	});

	it("toasts and starts the 60s cooldown on a successful resend", async () => {
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
		expect(mockToastSuccess).toHaveBeenCalledWith("Verification email sent");
		expect(mockStart).toHaveBeenCalledWith(60);
	});

	it("shows a live countdown (never a 'Sent' label) while on cooldown", () => {
		mockSecondsLeft = 60;
		render(<EmailVerificationPrompt email="asha@example.com" />);

		expect(
			screen.getByRole("button", { name: /resend in 60s/i }),
		).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: /sent/i }),
		).not.toBeInTheDocument();
	});

	it("surfaces an error and stays resendable (no cooldown, no toast) when the resend fails", async () => {
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
		expect(mockToastSuccess).not.toHaveBeenCalled();
		expect(mockStart).not.toHaveBeenCalled();
		expect(
			screen.getByRole("button", { name: /resend verification email/i }),
		).toBeEnabled();
	});
});

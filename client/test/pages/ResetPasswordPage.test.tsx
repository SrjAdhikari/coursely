//* test/pages/ResetPasswordPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

const mockResetPassword = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useResetPassword: () => ({ mutate: mockResetPassword, isPending: false }),
}));

import ResetPasswordPage from "@/pages/ResetPasswordPage";

const renderPage = (initialEntry = "/reset-password?token=reset-token") =>
	render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<ResetPasswordPage />
		</MemoryRouter>,
	);

describe("ResetPasswordPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows an invalid-link message when the token is missing", () => {
		renderPage("/reset-password");

		expect(
			screen.getByText(/reset link is invalid or has expired/i),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /reset password/i }),
		).not.toBeInTheDocument();
	});

	it("rejects a mismatched confirmation and does not submit", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText("New password"), "Password1!");
		await user.type(screen.getByLabelText("Confirm password"), "Password2!");
		await user.click(screen.getByRole("button", { name: /reset password/i }));

		expect(
			await screen.findByText(/passwords do not match/i),
		).toBeInTheDocument();
		expect(mockResetPassword).not.toHaveBeenCalled();
	});

	it("submits the token and new password when the form is valid", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText("New password"), "Password1!");
		await user.type(screen.getByLabelText("Confirm password"), "Password1!");
		await user.click(screen.getByRole("button", { name: /reset password/i }));

		await waitFor(() =>
			expect(mockResetPassword).toHaveBeenCalledWith(
				{ token: "reset-token", newPassword: "Password1!" },
				expect.any(Object),
			),
		);
	});

	it("shows the success state with a login CTA after a successful reset", async () => {
		mockResetPassword.mockImplementation((_payload, options) =>
			options.onSuccess(),
		);
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText("New password"), "Password1!");
		await user.type(screen.getByLabelText("Confirm password"), "Password1!");
		await user.click(screen.getByRole("button", { name: /reset password/i }));

		expect(await screen.findByText(/password has been reset/i)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /go to log in/i })).toHaveAttribute(
			"href",
			"/login",
		);
	});
});

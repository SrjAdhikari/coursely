//* test/pages/ForgotPasswordPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

const mockRequestReset = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useForgotPassword: () => ({ mutate: mockRequestReset, isPending: false }),
}));

import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

const renderPage = () =>
	render(
		<MemoryRouter initialEntries={["/forgot-password"]}>
			<ForgotPasswordPage />
		</MemoryRouter>,
	);

describe("ForgotPasswordPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejects an invalid email and does not submit", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/email/i), "not-an-email");
		await user.click(screen.getByRole("button", { name: /send reset link/i }));

		expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
		expect(mockRequestReset).not.toHaveBeenCalled();
	});

	it("shows the generic notice after submitting a valid email", async () => {
		mockRequestReset.mockImplementation((_values, options) =>
			options.onSuccess(),
		);
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/email/i), "asha@example.com");
		await user.click(screen.getByRole("button", { name: /send reset link/i }));

		await waitFor(() =>
			expect(mockRequestReset).toHaveBeenCalledWith(
				{ email: "asha@example.com" },
				expect.any(Object),
			),
		);
		expect(
			await screen.findByText(/if an account exists for that email/i),
		).toBeInTheDocument();
	});
});

//* test/pages/RegisterPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockMutate = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useRegister: () => ({ mutate: mockMutate, isPending: false }),
}));

import RegisterPage from "@/pages/RegisterPage";

const renderPage = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter>
				<RegisterPage />
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("RegisterPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejects a weak password and does not submit", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/name/i), "Asha Rai");
		await user.type(screen.getByLabelText(/email/i), "asha@example.com");
		await user.type(screen.getByLabelText("Password"), "alllowercase");
		await user.click(screen.getByRole("button", { name: /create account/i }));

		expect(
			await screen.findByText(/password must contain/i),
		).toBeInTheDocument();
		expect(mockMutate).not.toHaveBeenCalled();
	});

	it("calls the register mutation with a valid strong password", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/name/i), "Asha Rai");
		await user.type(screen.getByLabelText(/email/i), "asha@example.com");
		await user.type(screen.getByLabelText("Password"), "Password1!");
		await user.click(screen.getByRole("button", { name: /create account/i }));

		await waitFor(() =>
			expect(mockMutate).toHaveBeenCalledWith(
				{
					name: "Asha Rai",
					email: "asha@example.com",
					password: "Password1!",
				},
				expect.any(Object),
			),
		);
	});

	it("shows a form-level error when the email is already taken", async () => {
		mockMutate.mockImplementation((_values, options) =>
			options.onError({
				message: "An account with this email already exists",
				code: "USER_ALREADY_EXISTS",
			}),
		);
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/name/i), "Asha Rai");
		await user.type(screen.getByLabelText(/email/i), "dupe@example.com");
		await user.type(screen.getByLabelText("Password"), "Password1!");
		await user.click(screen.getByRole("button", { name: /create account/i }));

		expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
	});
});

//* test/pages/LoginPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockMutate = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useLogin: () => ({ mutate: mockMutate, isPending: false }),
}));

import LoginPage from "@/pages/LoginPage";

const renderPage = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("LoginPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows a validation error and does not submit an invalid email", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/email/i), "not-an-email");
		await user.type(screen.getByLabelText("Password"), "secret");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
		expect(mockMutate).not.toHaveBeenCalled();
	});

	it("calls the login mutation with valid credentials", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/email/i), "asha@example.com");
		await user.type(screen.getByLabelText("Password"), "Password1!");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		await waitFor(() =>
			expect(mockMutate).toHaveBeenCalledWith(
				{ email: "asha@example.com", password: "Password1!" },
				expect.any(Object),
			),
		);
	});

	it("shows a form-level error when the credentials are rejected", async () => {
		mockMutate.mockImplementation((_values, options) =>
			options.onError({
				message: "Invalid email or password",
				code: "INVALID_CREDENTIALS",
			}),
		);
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/email/i), "asha@example.com");
		await user.type(screen.getByLabelText("Password"), "Password1!");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(
			await screen.findByText(/invalid email or password/i),
		).toBeInTheDocument();
	});
});

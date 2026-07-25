//* test/pages/RegisterPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockRegister = vi.fn();
const mockGoogleMutate = vi.fn();
const mockResend = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useRegister: () => ({ mutate: mockRegister, isPending: false }),
	useGoogleSignIn: () => ({ mutate: mockGoogleMutate, isPending: false }),
	useResendVerification: () => ({ mutate: mockResend, isPending: false }),
}));

vi.mock("@/components/auth/GoogleSignInButton", () => ({
	default: ({
		onSuccess,
		disabled,
	}: {
		onSuccess: (idToken: string) => void;
		onError: () => void;
		disabled?: boolean;
	}) => (
		<button disabled={disabled} onClick={() => onSuccess("google-id-token")}>
			Sign up with Google
		</button>
	),
}));

import RegisterPage from "@/pages/RegisterPage";

const renderPage = (initialEntry = "/signup") =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter initialEntries={[initialEntry]}>
				<RegisterPage />
			</MemoryRouter>
		</QueryClientProvider>,
	);

const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText(/name/i), "Asha Rai");
	await user.type(screen.getByLabelText(/email/i), "asha@example.com");
	await user.type(screen.getByLabelText("Password"), "Password1!");
	await user.click(screen.getByRole("button", { name: /create account/i }));
};

describe("RegisterPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("carries the ?redirect param onto the Log in tab link", () => {
		renderPage("/signup?redirect=%2Fcourses%2Freact-basics");

		expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
			"href",
			"/login?redirect=%2Fcourses%2Freact-basics",
		);
	});

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
		expect(mockRegister).not.toHaveBeenCalled();
	});

	it("calls the register mutation with a valid strong password", async () => {
		const user = userEvent.setup();
		renderPage();
		await fillValidForm(user);

		await waitFor(() =>
			expect(mockRegister).toHaveBeenCalledWith(
				{
					name: "Asha Rai",
					email: "asha@example.com",
					password: "Password1!",
				},
				expect.any(Object),
			),
		);
	});

	it("shows the check-inbox notice with the email once register succeeds", async () => {
		mockRegister.mockImplementation((_values, options) => options.onSuccess());
		const user = userEvent.setup();
		renderPage();
		await fillValidForm(user);

		expect(await screen.findByText(/verification link/i)).toBeInTheDocument();
		expect(screen.getByText("asha@example.com")).toBeInTheDocument();
		// The signup form is gone — no auto-login.
		expect(
			screen.queryByRole("button", { name: /create account/i }),
		).not.toBeInTheDocument();
	});

	it("resends the verification email from the check-inbox notice", async () => {
		mockRegister.mockImplementation((_values, options) => options.onSuccess());
		const user = userEvent.setup();
		renderPage();
		await fillValidForm(user);

		await user.click(
			await screen.findByRole("button", { name: /resend verification email/i }),
		);

		expect(mockResend).toHaveBeenCalledWith(
			{ email: "asha@example.com" },
			expect.any(Object),
		);
	});

	it("surfaces the error when register itself fails", async () => {
		mockRegister.mockImplementation((_values, options) =>
			options.onError({ message: "Something went wrong", code: "NETWORK_ERROR" }),
		);
		const user = userEvent.setup();
		renderPage();
		await fillValidForm(user);

		expect(
			await screen.findByText(/something went wrong/i),
		).toBeInTheDocument();
	});

	it("signs up with Google using the returned credential", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /sign up with google/i }),
		);

		expect(mockGoogleMutate).toHaveBeenCalledWith(
			{ idToken: "google-id-token" },
			expect.any(Object),
		);
	});

	it("surfaces a provider-mismatch error from Google sign-up", async () => {
		mockGoogleMutate.mockImplementation((_payload, options) =>
			options.onError({
				message:
					"This email is registered with a password. Please log in with your password.",
				code: "PROVIDER_MISMATCH",
			}),
		);
		const user = userEvent.setup();
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /sign up with google/i }),
		);

		expect(
			await screen.findByText(/registered with a password/i),
		).toBeInTheDocument();
	});
});

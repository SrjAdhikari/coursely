//* test/pages/LoginPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockMutate = vi.fn();
const mockGoogleMutate = vi.fn();
const mockResend = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useLogin: () => ({ mutate: mockMutate, isPending: false }),
	useGoogleSignIn: () => ({ mutate: mockGoogleMutate, isPending: false }),
	useResendVerification: () => ({ mutate: mockResend, isPending: false }),
}));

vi.mock("@/components/auth/GoogleSignInButton", () => ({
	default: ({
		onSuccess,
	}: {
		onSuccess: (idToken: string) => void;
		onError: () => void;
	}) => (
		<button onClick={() => onSuccess("google-id-token")}>
			Continue with Google
		</button>
	),
}));

import LoginPage from "@/pages/LoginPage";

const renderPage = (initialEntry = "/login") =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter initialEntries={[initialEntry]}>
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

	it("carries the ?redirect param onto the Sign up tab link", () => {
		renderPage("/login?redirect=%2Fcourses%2Freact-basics");

		expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
			"href",
			"/signup?redirect=%2Fcourses%2Freact-basics",
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

	it("signs in with Google using the returned credential", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /continue with google/i }),
		);

		expect(mockGoogleMutate).toHaveBeenCalledWith(
			{ idToken: "google-id-token" },
			expect.any(Object),
		);
	});

	it("shows the server error when Google sign-in is rejected", async () => {
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
			screen.getByRole("button", { name: /continue with google/i }),
		);

		expect(
			await screen.findByText(/registered with a password/i),
		).toBeInTheDocument();
	});

	it("renders a Forgot password link to the reset flow", () => {
		renderPage();

		expect(
			screen.getByRole("link", { name: /forgot password/i }),
		).toHaveAttribute("href", "/forgot-password");
	});

	it("offers a resend action when the account is unverified", async () => {
		mockMutate.mockImplementation((_values, options) =>
			options.onError({
				message: "Please verify your email address",
				code: "EMAIL_NOT_VERIFIED",
			}),
		);
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/email/i), "asha@example.com");
		await user.type(screen.getByLabelText("Password"), "Password1!");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(
			await screen.findByRole("button", { name: /resend verification email/i }),
		).toBeInTheDocument();
		expect(screen.getByText("asha@example.com")).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: /resend verification email/i }),
		);
		expect(mockResend).toHaveBeenCalledWith(
			{ email: "asha@example.com" },
			expect.any(Object),
		);
	});
});

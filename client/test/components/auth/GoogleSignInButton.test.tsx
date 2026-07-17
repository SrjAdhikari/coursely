//* test/components/auth/GoogleSignInButton.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Stub Google's widget with buttons that drive onSuccess (with/without a
// credential) and onError, so we can exercise the component's branches.
vi.mock("@react-oauth/google", () => ({
	GoogleLogin: ({
		onSuccess,
		onError,
	}: {
		onSuccess: (response: { credential?: string }) => void;
		onError: () => void;
	}) => (
		<>
			<button
				data-testid="google-ok"
				onClick={() => onSuccess({ credential: "google-id-token" })}
			>
				ok
			</button>
			<button data-testid="google-no-credential" onClick={() => onSuccess({})}>
				no-credential
			</button>
			<button data-testid="google-error" onClick={onError}>
				error
			</button>
		</>
	),
}));

import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

describe("GoogleSignInButton", () => {
	it("forwards the Google credential to onSuccess", async () => {
		const onSuccess = vi.fn();
		const onError = vi.fn();
		const user = userEvent.setup();
		render(<GoogleSignInButton onSuccess={onSuccess} onError={onError} />);

		await user.click(screen.getByTestId("google-ok"));
		expect(onSuccess).toHaveBeenCalledWith("google-id-token");
		expect(onError).not.toHaveBeenCalled();
	});

	it("calls onError when the response has no credential", async () => {
		const onSuccess = vi.fn();
		const onError = vi.fn();
		const user = userEvent.setup();
		render(<GoogleSignInButton onSuccess={onSuccess} onError={onError} />);

		await user.click(screen.getByTestId("google-no-credential"));
		expect(onError).toHaveBeenCalled();
		expect(onSuccess).not.toHaveBeenCalled();
	});

	it("calls onError when the Google widget errors", async () => {
		const onSuccess = vi.fn();
		const onError = vi.fn();
		const user = userEvent.setup();
		render(<GoogleSignInButton onSuccess={onSuccess} onError={onError} />);

		await user.click(screen.getByTestId("google-error"));
		expect(onError).toHaveBeenCalled();
	});

	it("renders a custom label", () => {
		render(
			<GoogleSignInButton
				onSuccess={vi.fn()}
				onError={vi.fn()}
				label="Sign up with Google"
			/>,
		);
		expect(screen.getByText("Sign up with Google")).toBeInTheDocument();
	});
});

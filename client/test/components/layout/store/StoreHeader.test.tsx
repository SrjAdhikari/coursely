//* test/components/layout/store/StoreHeader.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockUseCurrentUser = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => mockUseCurrentUser(),
}));

import StoreHeader from "@/components/layout/store/StoreHeader";

const renderHeaderAt = (initialPath = "/") =>
	render(
		<MemoryRouter initialEntries={[initialPath]}>
			<StoreHeader />
		</MemoryRouter>,
	);

const loggedIn = () =>
	mockUseCurrentUser.mockReturnValue({
		data: { data: { name: "Suraj", role: "student" } },
	});

describe("StoreHeader", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows Log in / Sign up when logged out", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHeaderAt();
		expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: /library/i }),
		).not.toBeInTheDocument();
	});

	it("shows the Library link and the user's name when logged in", () => {
		loggedIn();
		renderHeaderAt();
		expect(screen.getByRole("link", { name: /library/i })).toHaveAttribute(
			"href",
			"/my-courses",
		);
		expect(screen.getByText("Suraj")).toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: /sign up/i }),
		).not.toBeInTheDocument();
	});

	it("shows a Dashboard link to /dashboard when logged in", () => {
		loggedIn();
		renderHeaderAt();
		expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
			"href",
			"/dashboard",
		);
	});

	it("marks the active nav item with aria-current", () => {
		loggedIn();
		renderHeaderAt("/dashboard");
		expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(
			screen.getByRole("link", { name: /browse/i }),
		).not.toHaveAttribute("aria-current", "page");
	});

	it("renders a theme toggle", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHeaderAt();
		expect(
			screen.getByRole("button", { name: /toggle theme/i }),
		).toBeInTheDocument();
	});
});

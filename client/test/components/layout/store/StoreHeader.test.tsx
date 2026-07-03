//* test/components/layout/store/StoreHeader.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockUseCurrentUser = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => mockUseCurrentUser(),
}));

import StoreHeader from "@/components/layout/store/StoreHeader";

const renderHeader = () =>
	render(
		<MemoryRouter>
			<StoreHeader />
		</MemoryRouter>,
	);

describe("StoreHeader", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows Log in / Sign up when logged out", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHeader();
		expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
		expect(screen.queryByText(/my courses/i)).not.toBeInTheDocument();
	});

	it("shows My Courses and the user's name when logged in", () => {
		mockUseCurrentUser.mockReturnValue({
			data: { data: { name: "Suraj", role: "student" } },
		});
		renderHeader();
		expect(
			screen.getByRole("link", { name: /my courses/i }),
		).toBeInTheDocument();
		expect(screen.getByText("Suraj")).toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: /sign up/i }),
		).not.toBeInTheDocument();
	});

	it("shows a Dashboard link to /dashboard when logged in", () => {
		mockUseCurrentUser.mockReturnValue({
			data: { data: { name: "Suraj", role: "student" } },
		});
		renderHeader();
		expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
			"href",
			"/dashboard",
		);
	});
});

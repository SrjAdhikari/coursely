import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockUseCurrentUser = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => mockUseCurrentUser(),
}));

import HomeFooter from "@/components/layout/home/HomeFooter";

const loggedInUser = {
	id: "u1",
	name: "Suraj Adhikari",
	email: "suraj@example.com",
	role: "student" as const,
};

const renderHomeFooter = () =>
	render(
		<MemoryRouter>
			<HomeFooter />
		</MemoryRouter>,
	);

describe("HomeFooter", () => {
	beforeEach(() => vi.clearAllMocks());

	it("renders a contentinfo landmark with the brand", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHomeFooter();
		expect(screen.getByRole("contentinfo")).toBeInTheDocument();
		// Brand shows in both the logo and the copyright line, so allow multiple.
		expect(screen.getAllByText(/coursely/i).length).toBeGreaterThan(0);
	});

	it("links to the catalog regardless of auth state", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHomeFooter();
		expect(
			screen.getByRole("link", { name: /browse courses/i }),
		).toHaveAttribute("href", "/courses");
	});

	it("shows Log in and Sign up when signed out", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHomeFooter();
		expect(screen.getByRole("link", { name: /^log in$/i })).toHaveAttribute(
			"href",
			"/login",
		);
		expect(screen.getByRole("link", { name: /^sign up$/i })).toHaveAttribute(
			"href",
			"/signup",
		);
		expect(
			screen.queryByRole("link", { name: /dashboard/i }),
		).not.toBeInTheDocument();
	});

	it("shows Dashboard and My courses when signed in", () => {
		mockUseCurrentUser.mockReturnValue({ data: { data: loggedInUser } });
		renderHomeFooter();
		expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
			"href",
			"/dashboard",
		);
		expect(
			screen.getByRole("link", { name: /my courses/i }),
		).toHaveAttribute("href", "/my-courses");
		expect(
			screen.queryByRole("link", { name: /log in/i }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: /sign up/i }),
		).not.toBeInTheDocument();
	});
});

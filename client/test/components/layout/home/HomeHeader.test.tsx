import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockUseCurrentUser = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => mockUseCurrentUser(),
	useLogout: () => ({ mutate: vi.fn() }),
}));

import HomeHeader from "@/components/layout/home/HomeHeader";

const renderHeader = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter>
				<HomeHeader />
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("HomeHeader", () => {
	it("shows Log in and Sign up when logged out", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHeader();
		expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
		expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/signup");
	});

	it("shows Dashboard, Library, and the account menu when logged in", () => {
		mockUseCurrentUser.mockReturnValue({
			data: {
				data: {
					id: "u1",
					name: "Suraj",
					email: "suraj@example.com",
					role: "student",
				},
			},
		});
		renderHeader();
		expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
		expect(screen.getByRole("link", { name: /library/i })).toHaveAttribute("href", "/my-courses");
		expect(
			screen.getByRole("button", { name: /account menu/i }),
		).toBeInTheDocument();
	});

	it("links Courses to the catalog", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHeader();
		expect(screen.getByRole("link", { name: /^courses$/i })).toHaveAttribute("href", "/courses");
	});
});

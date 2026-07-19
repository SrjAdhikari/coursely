import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockUseCurrentUser = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => mockUseCurrentUser(),
	useLogout: () => ({ mutate: vi.fn() }),
}));

const mockUseActiveSection = vi.fn((): string | null => null);
vi.mock("@/hooks/useActiveSection", () => ({
	default: () => mockUseActiveSection(),
}));

afterEach(() => mockUseActiveSection.mockReturnValue(null));

import HomeHeader from "@/components/layout/home/HomeHeader";

const loggedInUser = {
	id: "u1",
	name: "Suraj Adhikari",
	email: "suraj@example.com",
	role: "student" as const,
};

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

	it("shows Dashboard, My Courses, and the account menu when logged in", () => {
		mockUseCurrentUser.mockReturnValue({ data: { data: loggedInUser } });
		renderHeader();
		expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
		expect(screen.getByRole("link", { name: /my courses/i })).toHaveAttribute("href", "/my-courses");
		expect(
			screen.getByRole("button", { name: /account menu/i }),
		).toBeInTheDocument();
	});

	it("links Courses to the catalog", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHeader();
		expect(screen.getByRole("link", { name: /^courses$/i })).toHaveAttribute("href", "/courses");
	});

	it("links the logo to home when logged out", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		renderHeader();
		expect(screen.getByRole("link", { name: /manakuru/i })).toHaveAttribute(
			"href",
			"/",
		);
	});

	it("links the logo to the dashboard when logged in", () => {
		mockUseCurrentUser.mockReturnValue({ data: { data: loggedInUser } });
		renderHeader();
		expect(screen.getByRole("link", { name: /manakuru/i })).toHaveAttribute(
			"href",
			"/dashboard",
		);
	});

	it("marks the nav link active for the section currently in view", () => {
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		mockUseActiveSection.mockReturnValue("faq");
		renderHeader();

		expect(screen.getByRole("link", { name: /^faq$/i })).toHaveAttribute(
			"aria-current",
			"true",
		);
		expect(screen.getByRole("link", { name: /^why$/i })).not.toHaveAttribute(
			"aria-current",
		);
	});

	describe("mobile menu", () => {
		it("renders a hamburger button that opens the mobile menu", async () => {
			mockUseCurrentUser.mockReturnValue({ data: undefined });
			renderHeader();
			const hamburger = screen.getByRole("button", { name: /open menu/i });
			expect(hamburger).toBeInTheDocument();
			await userEvent.click(hamburger);
			expect(await screen.findByRole("dialog")).toBeInTheDocument();
		});

		it("shows account links and a logout control for a logged-in user", async () => {
			mockUseCurrentUser.mockReturnValue({ data: { data: loggedInUser } });
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: /open menu/i }));

			const sheet = await screen.findByRole("dialog");
			expect(within(sheet).getByText("Suraj Adhikari")).toBeInTheDocument();
			expect(within(sheet).getByText("suraj@example.com")).toBeInTheDocument();
			expect(
				within(sheet).getByRole("link", { name: /dashboard/i }),
			).toHaveAttribute("href", "/dashboard");
			expect(
				within(sheet).getByRole("link", { name: /library|my courses/i }),
			).toHaveAttribute("href", "/my-courses");
			expect(
				within(sheet).getByRole("button", { name: /log out/i }),
			).toBeInTheDocument();
		});

		it("shows login and signup links for a logged-out user", async () => {
			mockUseCurrentUser.mockReturnValue({ data: undefined });
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: /open menu/i }));

			const sheet = await screen.findByRole("dialog");
			expect(
				within(sheet).getByRole("link", { name: /log in/i }),
			).toHaveAttribute("href", "/login");
			expect(
				within(sheet).getByRole("link", { name: /sign up/i }),
			).toHaveAttribute("href", "/signup");
		});

		it("closes the mobile menu after a navigation link is activated", async () => {
			mockUseCurrentUser.mockReturnValue({ data: { data: loggedInUser } });
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: /open menu/i }));

			const sheet = await screen.findByRole("dialog");
			await userEvent.click(
				within(sheet).getByRole("link", { name: /dashboard/i }),
			);
			await waitFor(() =>
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
			);
		});
	});
});

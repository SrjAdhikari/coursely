import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";

vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => ({ data: undefined }),
}));

import HomeLayout from "@/components/layout/home/HomeLayout";

describe("HomeLayout", () => {
	it("renders the marketing header, footer, and outlet content", () => {
		render(
			<MemoryRouter initialEntries={["/"]}>
				<Routes>
					<Route element={<HomeLayout />}>
						<Route path="/" element={<p>page content</p>} />
					</Route>
				</Routes>
			</MemoryRouter>,
		);
		expect(screen.getByRole("banner")).toBeInTheDocument(); // <header>
		expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // <footer>
		expect(screen.getByText("page content")).toBeInTheDocument(); // <Outlet/>
	});
});

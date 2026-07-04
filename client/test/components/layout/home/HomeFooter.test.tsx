import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import HomeFooter from "@/components/layout/home/HomeFooter";

const renderHomeFooter = () =>
	render(
		<MemoryRouter>
			<HomeFooter />
		</MemoryRouter>,
	);

describe("HomeFooter", () => {
	it("renders a contentinfo landmark with the brand", () => {
		renderHomeFooter();
		expect(screen.getByRole("contentinfo")).toBeInTheDocument();
		// Brand shows in both the logo and the copyright line, so allow multiple.
		expect(screen.getAllByText(/coursely/i).length).toBeGreaterThan(0);
	});

	it("links to the catalog and auth routes", () => {
		renderHomeFooter();
		expect(screen.getByRole("link", { name: /browse courses/i })).toHaveAttribute("href", "/courses");
		expect(screen.getByRole("link", { name: /^log in$/i })).toHaveAttribute("href", "/login");
		expect(screen.getByRole("link", { name: /^sign up$/i })).toHaveAttribute("href", "/signup");
	});
});

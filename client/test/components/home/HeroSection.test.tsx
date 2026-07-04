import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";

import HeroSection from "@/components/home/HeroSection";

const LocationProbe = () => {
	const location = useLocation();
	return <div data-testid="location">{location.pathname + location.search}</div>;
};

const renderHeroSection = () =>
	render(
		<MemoryRouter initialEntries={["/"]}>
			<HeroSection courseCount={12} />
			<LocationProbe />
		</MemoryRouter>,
	);

describe("HeroSection", () => {
	it("navigates to the catalog with the query on search submit", async () => {
		renderHeroSection();
		await userEvent.type(screen.getByRole("searchbox"), "react");
		await userEvent.click(screen.getByRole("button", { name: /search/i }));
		expect(screen.getByTestId("location")).toHaveTextContent("/courses?q=react");
	});

	it("shows the real course count", () => {
		renderHeroSection();
		expect(screen.getByText("12")).toBeInTheDocument();
	});
});

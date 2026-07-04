//* test/pages/HomePage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockUseListPublishedCourses = vi.fn();
vi.mock("@/hooks/useCourses", () => ({
	useListPublishedCourses: () => mockUseListPublishedCourses(),
}));

import HomePage from "@/pages/HomePage";

const renderPage = () =>
	render(
		<MemoryRouter>
			<HomePage />
		</MemoryRouter>,
	);

describe("HomePage", () => {
	beforeEach(() => {
		mockUseListPublishedCourses.mockReturnValue({
			data: { data: [] },
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
	});

	it("renders the hero search and the featured section", () => {
		renderPage();
		expect(screen.getByRole("searchbox")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /start with a course/i }),
		).toBeInTheDocument();
	});
});

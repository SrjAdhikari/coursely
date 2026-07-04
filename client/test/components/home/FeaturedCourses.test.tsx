import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockUseListPublishedCourses = vi.fn();
vi.mock("@/hooks/useCourses", () => ({
	useListPublishedCourses: () => mockUseListPublishedCourses(),
}));

import FeaturedCourses from "@/components/home/FeaturedCourses";

const makeCourse = (over: Record<string, unknown>) => ({
	_id: "1",
	title: "HTML Foundations",
	slug: "html-foundations",
	description: "Build real pages.",
	instructorName: "Anurag Singh",
	thumbnailUrl: "",
	price: 49900,
	currency: "INR",
	isPublished: true,
	createdAt: "",
	...over,
});

const renderIt = () =>
	render(
		<MemoryRouter>
			<FeaturedCourses />
		</MemoryRouter>,
	);

describe("FeaturedCourses", () => {
	it("renders a card per course and a Browse-all link", () => {
		mockUseListPublishedCourses.mockReturnValue({
			data: {
				data: [
					makeCourse({ _id: "1", title: "HTML Foundations", slug: "html" }),
					makeCourse({ _id: "2", title: "JS Essentials", slug: "js" }),
				],
			},
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
		renderIt();
		expect(screen.getByText("HTML Foundations")).toBeInTheDocument();
		expect(screen.getByText("JS Essentials")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /browse all/i })).toHaveAttribute("href", "/courses");
	});

	it("shows a loader while loading", () => {
		mockUseListPublishedCourses.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
		renderIt();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows an error state on failure", () => {
		mockUseListPublishedCourses.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });
		renderIt();
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("shows an empty state when there are no courses", () => {
		mockUseListPublishedCourses.mockReturnValue({ data: { data: [] }, isLoading: false, isError: false, refetch: vi.fn() });
		renderIt();
		expect(screen.getByText(/no courses/i)).toBeInTheDocument();
	});
});

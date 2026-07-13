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

const mockCourses = (courses: ReturnType<typeof makeCourse>[]) =>
	mockUseListPublishedCourses.mockReturnValue({
		data: { data: courses },
		isLoading: false,
		isError: false,
		refetch: vi.fn(),
	});

const renderIt = () =>
	render(
		<MemoryRouter>
			<FeaturedCourses />
		</MemoryRouter>,
	);

describe("FeaturedCourses", () => {
	it("shows only the first 3 courses and the Browse-all link when there are more than 3", () => {
		mockCourses([
			makeCourse({ _id: "1", title: "Course One", slug: "one" }),
			makeCourse({ _id: "2", title: "Course Two", slug: "two" }),
			makeCourse({ _id: "3", title: "Course Three", slug: "three" }),
			makeCourse({ _id: "4", title: "Course Four", slug: "four" }),
			makeCourse({ _id: "5", title: "Course Five", slug: "five" }),
		]);
		renderIt();

		expect(screen.getByText("Course One")).toBeInTheDocument();
		expect(screen.getByText("Course Two")).toBeInTheDocument();
		expect(screen.getByText("Course Three")).toBeInTheDocument();
		expect(screen.queryByText("Course Four")).not.toBeInTheDocument();
		expect(screen.queryByText("Course Five")).not.toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /browse all/i }),
		).toHaveAttribute("href", "/courses");
	});

	it("renders every course and hides the Browse-all link when there are 3 or fewer", () => {
		mockCourses([
			makeCourse({ _id: "1", title: "Course One", slug: "one" }),
			makeCourse({ _id: "2", title: "Course Two", slug: "two" }),
			makeCourse({ _id: "3", title: "Course Three", slug: "three" }),
		]);
		renderIt();

		expect(screen.getByText("Course One")).toBeInTheDocument();
		expect(screen.getByText("Course Two")).toBeInTheDocument();
		expect(screen.getByText("Course Three")).toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: /browse all/i }),
		).not.toBeInTheDocument();
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

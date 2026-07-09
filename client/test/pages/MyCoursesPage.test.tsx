//* test/pages/MyCoursesPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import MyCoursesPage from "@/pages/MyCoursesPage";
import type { LearningOverviewPayload } from "@/types/learning.types";

const mockOverview = vi.fn();
vi.mock("@/hooks/useLearningOverview", () => ({ default: () => mockOverview() }));

const payload: LearningOverviewPayload = {
	stats: { enrolled: 3, inProgress: 1, completed: 1, lessonsCompleted: 12, totalLessons: 30, overallPercent: 40 },
	courses: [
		{ courseId: "a", title: "React from Scratch", slug: "react", thumbnailUrl: "", instructorName: "Priya",
			totalLessons: 18, completedLessons: 7, percentComplete: 39, state: "in_progress",
			lastActivityAt: "2026-07-02T00:00:00Z",
			nextLesson: { lessonId: "l9", title: "Effects", lessonNumber: 9, sectionTitle: "Hooks" } },
		{ courseId: "b", title: "CSS Layouts", slug: "css", thumbnailUrl: "", instructorName: "Meera",
			totalLessons: 14, completedLessons: 0, percentComplete: 0, state: "not_started",
			lastActivityAt: null,
			nextLesson: { lessonId: "l1", title: "Box model", lessonNumber: 1, sectionTitle: "Basics" } },
		{ courseId: "c", title: "JavaScript Essentials", slug: "js", thumbnailUrl: "", instructorName: "Anurag",
			totalLessons: 12, completedLessons: 12, percentComplete: 100, state: "completed",
			lastActivityAt: "2026-06-30T00:00:00Z", nextLesson: null },
	],
	recentLessons: [],
};

const renderPage = () => render(<MemoryRouter><MyCoursesPage /></MemoryRouter>);

beforeEach(() => mockOverview.mockReset());

describe("MyCoursesPage", () => {
	it("shows the loader while loading", () => {
		mockOverview.mockReturnValue({ isLoading: true });
		renderPage();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows the load-failed state on error", () => {
		mockOverview.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });
		renderPage();
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("shows the empty state with a browse CTA when there are no courses", () => {
		mockOverview.mockReturnValue({ data: { data: { ...payload, courses: [] } }, isLoading: false, isError: false });
		renderPage();
		expect(screen.getByText(/no courses yet/i)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /browse courses/i })).toHaveAttribute("href", "/courses");
	});

	it("groups all courses by state, including not-started", () => {
		mockOverview.mockReturnValue({ data: { data: payload }, isLoading: false, isError: false });
		renderPage();
		expect(screen.getByText("In progress")).toBeInTheDocument();
		expect(screen.getByText("Not started")).toBeInTheDocument();
		expect(screen.getByText("Completed")).toBeInTheDocument();
		expect(screen.getByText("CSS Layouts")).toBeInTheDocument();          // not-started shown here
		expect(screen.getByText("React from Scratch")).toBeInTheDocument();    // in-progress
		expect(screen.getByText("JavaScript Essentials")).toBeInTheDocument(); // completed
		expect(screen.getAllByText("1 course")).toHaveLength(3); // per-group count, one each
	});

	it("shows a singular course count in the header when there is exactly one enrolled course", () => {
		mockOverview.mockReturnValue({
			data: { data: { ...payload, courses: [payload.courses[0]] } },
			isLoading: false,
			isError: false,
		});
		renderPage();
		expect(screen.getByText("1 course · 12 of 30 lessons done")).toBeInTheDocument();
	});

	it("shows a plural course count in the header for multiple enrolled courses", () => {
		mockOverview.mockReturnValue({ data: { data: payload }, isLoading: false, isError: false });
		renderPage();
		expect(screen.getByText("3 courses · 12 of 30 lessons done")).toBeInTheDocument();
	});

	it("shows a singular lesson label in the header when totalLessons is 1", () => {
		mockOverview.mockReturnValue({
			data: { data: { ...payload, stats: { ...payload.stats, totalLessons: 1 }, courses: [payload.courses[0]] } },
			isLoading: false,
			isError: false,
		});
		renderPage();
		expect(screen.getByText("1 course · 12 of 1 lesson done")).toBeInTheDocument();
	});
});

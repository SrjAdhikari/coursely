import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import DashboardPage from "@/pages/DashboardPage";
import type { LearningOverviewPayload } from "@/types/learning.types";

const mockOverview = vi.fn();
const mockUser = vi.fn();
vi.mock("@/hooks/useLearningOverview", () => ({ default: () => mockOverview() }));
vi.mock("@/hooks/useAuth", () => ({ useCurrentUser: () => mockUser() }));

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

const renderPage = () => render(<MemoryRouter><DashboardPage /></MemoryRouter>);

beforeEach(() => {
	mockOverview.mockReset();
	mockUser.mockReset();
	mockUser.mockReturnValue({ data: { data: { id: "u", name: "Aditya Rao", email: "a@x.co", role: "student" } } });
});

describe("DashboardPage", () => {
	it("shows a loader while fetching", () => {
		mockOverview.mockReturnValue({ isLoading: true });
		renderPage();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows the empty state with a browse CTA when there are no enrollments", () => {
		mockOverview.mockReturnValue({
			data: { data: { ...payload, stats: { ...payload.stats, enrolled: 0 }, courses: [] } },
			isLoading: false, isError: false,
		});
		renderPage();
		expect(screen.getByText(/no courses yet/i)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /browse/i })).toBeInTheDocument();
	});

	it("greets the user and lists in-progress + completed courses, but NOT not-started", () => {
		mockOverview.mockReturnValue({ data: { data: payload }, isLoading: false, isError: false });
		renderPage();
		expect(screen.getByText(/aditya/i)).toBeInTheDocument();
		expect(screen.getByText("React from Scratch")).toBeInTheDocument();     // in_progress, listed
		expect(screen.getByText("JavaScript Essentials")).toBeInTheDocument();  // completed, listed
		expect(screen.queryByText("CSS Layouts")).not.toBeInTheDocument();      // not_started excluded
	});
});

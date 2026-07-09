import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CourseProgressRow from "@/components/dashboard/CourseProgressRow";
import type { LearningCoursePayload } from "@/types/learning.types";

const base: LearningCoursePayload = {
	courseId: "c1", title: "React from Scratch", slug: "react-from-scratch",
	thumbnailUrl: "", instructorName: "Priya Nair",
	totalLessons: 18, completedLessons: 7, percentComplete: 39,
	state: "in_progress", lastActivityAt: "2026-07-02T09:00:00Z",
	nextLesson: { lessonId: "l9", title: "Effects & the dependency array", lessonNumber: 9, sectionTitle: "State & hooks" },
};

const renderRow = (course: LearningCoursePayload) =>
	render(<MemoryRouter><CourseProgressRow course={course} /></MemoryRouter>);

describe("CourseProgressRow", () => {
	it("shows title, instructor and the percent + lesson count", () => {
		renderRow(base);
		expect(screen.getByText("React from Scratch")).toBeInTheDocument();
		expect(screen.getByText("Priya Nair")).toBeInTheDocument();
		expect(screen.getByText(/39% · 7 \/ 18 lessons/)).toBeInTheDocument();
	});

	it("shows a singular lesson label when totalLessons is 1", () => {
		renderRow({ ...base, totalLessons: 1, completedLessons: 0, percentComplete: 0 });
		expect(screen.getByText("0% · 0 / 1 lesson")).toBeInTheDocument();
	});

	it("in_progress → shows the next lesson and Resume links to it", () => {
		renderRow(base);
		expect(
			screen.getByText("Next: Effects & the dependency array"),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /resume/i })).toHaveAttribute(
			"href", "/learn/react-from-scratch/l9",
		);
	});

	it("not_started → shows the not-started line and Start links to the course", () => {
		renderRow({ ...base, state: "not_started", completedLessons: 0, percentComplete: 0,
			lastActivityAt: null, nextLesson: { lessonId: "l1", title: "Intro", lessonNumber: 1, sectionTitle: "Getting started" } });
		expect(screen.getByText(/not started yet/i)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /start/i })).toHaveAttribute(
			"href", "/learn/react-from-scratch/l1",
		);
	});

	it("completed → shows the completed pill and all-lessons line, no resume link", () => {
		renderRow({ ...base, state: "completed", completedLessons: 18, percentComplete: 100, nextLesson: null });
		expect(screen.getByText(/completed/i)).toBeInTheDocument();
		expect(screen.getByText("All lessons complete")).toBeInTheDocument();
		expect(screen.queryByRole("link", { name: /resume/i })).not.toBeInTheDocument();
	});

	it("renders the course thumbnail image when a thumbnailUrl is present", () => {
		renderRow({ ...base, thumbnailUrl: "https://cdn.test/react.jpg" });
		expect(screen.getByRole("img", { name: /react from scratch/i })).toHaveAttribute(
			"src", "https://cdn.test/react.jpg",
		);
	});

	it("falls back to the title initial when there is no thumbnailUrl", () => {
		renderRow({ ...base, thumbnailUrl: "" });
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
		expect(screen.getByText("R")).toBeInTheDocument();
	});
});

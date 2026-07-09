import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import ContinueLearningCard from "@/components/dashboard/ContinueLearningCard";
import type { LearningCoursePayload } from "@/types/learning.types";

const make = (over: Partial<LearningCoursePayload>): LearningCoursePayload => ({
	courseId: "c", title: "T", slug: "t", thumbnailUrl: "", instructorName: "I",
	totalLessons: 10, completedLessons: 3, percentComplete: 30,
	state: "in_progress", lastActivityAt: "2026-07-01T00:00:00Z",
	nextLesson: { lessonId: "lx", title: "Next up", lessonNumber: 1, sectionTitle: "Getting started" }, ...over,
});

const renderCard = (courses: LearningCoursePayload[]) =>
	render(<MemoryRouter><ContinueLearningCard courses={courses} /></MemoryRouter>);

describe("ContinueLearningCard", () => {
	it("renders nothing when no course is in progress", () => {
		const { container } = renderCard([
			make({ state: "not_started", lastActivityAt: null }),
			make({ state: "completed", nextLesson: null }),
		]);
		expect(container).toBeEmptyDOMElement();
	});

	it("picks the most-recently-active course and links Resume to its next lesson", () => {
		renderCard([
			make({ slug: "older", lastActivityAt: "2026-07-01T00:00:00Z", nextLesson: { lessonId: "old", title: "Old", lessonNumber: 4, sectionTitle: "Older" } }),
			make({ slug: "newer", title: "Newest", lastActivityAt: "2026-07-03T00:00:00Z", nextLesson: { lessonId: "new", title: "Fresh", lessonNumber: 5, sectionTitle: "Fresher" } }),
		]);
		expect(screen.getByText("Fresh")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /resume/i })).toHaveAttribute("href", "/learn/newer/new");
	});

	it("shows the course thumbnail image when present", () => {
		renderCard([make({ title: "React", thumbnailUrl: "https://cdn.test/react.jpg" })]);
		expect(screen.getByRole("img", { name: /react/i })).toHaveAttribute(
			"src", "https://cdn.test/react.jpg",
		);
	});

	it("shows percent, course title and lesson counts on the progress line", () => {
		renderCard([make({ title: "React from Scratch", percentComplete: 39, completedLessons: 7, totalLessons: 18 })]);
		expect(
			screen.getByText(/39%.*React from Scratch.*7 \/ 18 lessons/),
		).toBeInTheDocument();
	});

	it("shows a singular lesson label when totalLessons is 1", () => {
		renderCard([make({ title: "Micro Course", completedLessons: 1, totalLessons: 1 })]);
		expect(screen.getByText(/1 \/ 1 lesson$/)).toBeInTheDocument();
	});

	it("shows the lesson number and section in the kick label", () => {
		renderCard([
			make({ nextLesson: { lessonId: "l9", title: "Effects", lessonNumber: 9, sectionTitle: "State & hooks" } }),
		]);
		expect(screen.getByText(/lesson 09 · state & hooks/i)).toBeInTheDocument();
	});

	it("falls back to the first word of the title when there is no thumbnail", () => {
		renderCard([make({ title: "React from Scratch", thumbnailUrl: "" })]);
		expect(screen.getByText("React")).toBeInTheDocument();
	});
});

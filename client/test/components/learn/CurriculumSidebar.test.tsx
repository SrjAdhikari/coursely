//* test/components/learn/CurriculumSidebar.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import CurriculumSidebar from "@/components/learn/CurriculumSidebar";
import type { PublicSectionPayload } from "@/types/course.types";
import type { ProgressPayload } from "@/types/progress.types";

const sections: PublicSectionPayload[] = [
	{
		_id: "s1",
		courseId: "c1",
		title: "Foundations",
		order: 0,
		lessons: [
			{ _id: "l1", sectionId: "s1", courseId: "c1", title: "Intro", order: 0, isPreview: true, duration: 120 },
			{ _id: "l2", sectionId: "s1", courseId: "c1", title: "Components", order: 1, isPreview: false, duration: 200 },
		],
	},
];

const progressByLesson = new Map<string, ProgressPayload>([
	["l1", { lessonId: "l1", positionSeconds: 120, completed: true }],
]);

const renderSidebar = (
	currentLessonId = "l2",
	overrides: Partial<{ completedCount: number; totalLessons: number }> = {},
) =>
	render(
		<MemoryRouter>
			<CurriculumSidebar
				courseTitle="Modern React"
				instructorName="Priya Nair"
				courseSlug="modern-react"
				sections={sections}
				progressByLesson={progressByLesson}
				currentLessonId={currentLessonId}
				overallPercent={50}
				completedCount={overrides.completedCount ?? 1}
				totalLessons={overrides.totalLessons ?? 2}
			/>
		</MemoryRouter>,
	);

describe("CurriculumSidebar", () => {
	it("renders the course header, sections, and lessons", () => {
		renderSidebar();
		expect(screen.getByText("Modern React")).toBeInTheDocument();
		expect(screen.getByText("Priya Nair")).toBeInTheDocument();
		expect(screen.getByText("Foundations")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Intro/ })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Components/ })).toBeInTheDocument();
	});

	it("shows the overall percent and the completed-of-total count", () => {
		renderSidebar();
		expect(screen.getByText("50% complete")).toBeInTheDocument();
		expect(screen.getByText("1 of 2 lessons")).toBeInTheDocument();
	});

	it("shows a singular lesson label when totalLessons is 1", () => {
		renderSidebar("l2", { completedCount: 1, totalLessons: 1 });
		expect(screen.getByText("1 of 1 lesson")).toBeInTheDocument();
	});

	it("marks only the current lesson with aria-current", () => {
		renderSidebar("l2");
		const currentRow = screen.getByRole("link", { current: true });
		expect(currentRow).toHaveTextContent("Components");
	});

	it("links each lesson to its learn route", () => {
		renderSidebar();
		expect(screen.getByRole("link", { name: /Components/ })).toHaveAttribute(
			"href",
			"/learn/modern-react/l2",
		);
	});
});

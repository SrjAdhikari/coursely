//* test/components/course/CurriculumAccordion.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CurriculumAccordion from "@/components/course/CurriculumAccordion";
import type { PublicSectionPayload } from "@/types/course.types";

const sections: PublicSectionPayload[] = [
	{
		_id: "s1",
		courseId: "c1",
		title: "Getting Started",
		order: 0,
		lessons: [
			{
				_id: "l1",
				sectionId: "s1",
				courseId: "c1",
				title: "Welcome",
				order: 0,
				isPreview: true,
				duration: 372,
			},
			{
				_id: "l2",
				sectionId: "s1",
				courseId: "c1",
				title: "Setup",
				order: 1,
				isPreview: false,
				duration: 843,
			},
		],
	},
];

// One section with a free preview, one fully locked.
const mixedSections: PublicSectionPayload[] = [
	{
		_id: "free",
		courseId: "c1",
		title: "Free Intro",
		order: 0,
		lessons: [
			{
				_id: "f1",
				sectionId: "free",
				courseId: "c1",
				title: "Free Lesson",
				order: 0,
				isPreview: true,
				duration: 100,
			},
		],
	},
	{
		_id: "locked",
		courseId: "c1",
		title: "Locked Deep Dive",
		order: 1,
		lessons: [
			{
				_id: "k1",
				sectionId: "locked",
				courseId: "c1",
				title: "Locked Lesson",
				order: 0,
				isPreview: false,
				duration: 200,
			},
		],
	},
];

const renderAccordion = (
	sectionsData: PublicSectionPayload[],
	slug = "react-basics",
) =>
	render(
		<MemoryRouter>
			<CurriculumAccordion sections={sectionsData} slug={slug} />
		</MemoryRouter>,
	);

describe("CurriculumAccordion", () => {
	it("renders sections and their lessons with durations", () => {
		renderAccordion(sections);
		expect(screen.getByText("Getting Started")).toBeInTheDocument();
		expect(screen.getByText("Welcome")).toBeInTheDocument();
		expect(screen.getByText("Setup")).toBeInTheDocument();
		expect(screen.getByText("6:12")).toBeInTheDocument();
		expect(screen.getByText("14:03")).toBeInTheDocument();
	});

	it("shows the lesson count and total time per section", () => {
		renderAccordion(sections);
		// 372s + 843s = 1215s → "20m"
		expect(screen.getByText(/2 lessons · 20m/i)).toBeInTheDocument();
	});

	it("marks free-preview lessons", () => {
		renderAccordion(sections);
		expect(screen.getByText("Preview")).toBeInTheDocument();
	});

	it("labels locked lessons with an enroll-to-unlock tag", () => {
		renderAccordion(sections);
		expect(screen.getByText(/enroll to unlock/i)).toBeInTheDocument();
	});

	it("links preview lessons to the preview route and leaves locked lessons unlinked", () => {
		renderAccordion(sections);
		expect(screen.getByRole("link", { name: /welcome/i })).toHaveAttribute(
			"href",
			"/courses/react-basics/preview/l1",
		);
		expect(
			screen.queryByRole("link", { name: /setup/i }),
		).not.toBeInTheDocument();
	});

	it("opens preview sections by default and collapses fully-locked ones", () => {
		renderAccordion(mixedSections);
		// Both section headers always render (accordion triggers).
		expect(screen.getByText("Free Intro")).toBeInTheDocument();
		expect(screen.getByText("Locked Deep Dive")).toBeInTheDocument();
		// The preview section is open → its lesson is visible.
		expect(screen.getByText("Free Lesson")).toBeInTheDocument();
		// The fully-locked section is collapsed → its lesson is not in the DOM.
		expect(screen.queryByText("Locked Lesson")).not.toBeInTheDocument();
	});

	it("renders a fallback when there are no sections", () => {
		renderAccordion([]);
		expect(screen.getByText(/curriculum coming soon/i)).toBeInTheDocument();
	});
});

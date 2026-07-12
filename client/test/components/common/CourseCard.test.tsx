//* test/components/common/CourseCard.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CourseCard from "@/components/common/CourseCard";

const renderCard = (props?: Partial<React.ComponentProps<typeof CourseCard>>) =>
	render(
		<MemoryRouter>
			<CourseCard
				to="/courses/react"
				title="React from the Ground Up"
				instructorName="Aarav Mehta"
				thumbnailUrl="https://img.test/react.png"
				meta="₹1,499"
				{...props}
			/>
		</MemoryRouter>,
	);

describe("CourseCard", () => {
	it("renders the title, instructor and meta and links to the target", () => {
		renderCard();
		expect(screen.getByText("React from the Ground Up")).toBeInTheDocument();
		expect(screen.getByText("Aarav Mehta")).toBeInTheDocument();
		expect(screen.getByText("₹1,499")).toBeInTheDocument();
		expect(screen.getByRole("link")).toHaveAttribute("href", "/courses/react");
	});

	it("renders the description when provided", () => {
		renderCard({ description: "Build real apps with hooks and context." });
		expect(
			screen.getByText("Build real apps with hooks and context."),
		).toBeInTheDocument();
	});

	it("renders a badge when provided", () => {
		renderCard({ badge: "Enrolled" });
		expect(screen.getByText("Enrolled")).toBeInTheDocument();
	});

	it("is a single clickable card with no separate action affordance", () => {
		renderCard();
		expect(screen.queryByText("View")).not.toBeInTheDocument();
	});

	it("renders the lesson count and category when provided", () => {
		renderCard({ lessonCount: 12, category: "Web Development" });
		expect(screen.getByText("12 lessons")).toBeInTheDocument();
		expect(screen.getByText("Web Development")).toBeInTheDocument();
	});

	it("omits the lesson count and category when not provided", () => {
		renderCard();
		expect(screen.queryByText(/lessons?$/i)).not.toBeInTheDocument();
	});

	it("renders a branded text placeholder when no thumbnailUrl is provided", () => {
		renderCard({ thumbnailUrl: undefined });
		// The title's first word stands in for the missing cover image.
		expect(screen.getByText("React")).toBeInTheDocument();
	});
});

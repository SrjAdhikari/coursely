//* test/components/common/EnrolledCourseCard.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockUseCourseProgress = vi.fn();
vi.mock("@/hooks/useProgress", () => ({
	useCourseProgress: () => mockUseCourseProgress(),
}));

import EnrolledCourseCard from "@/components/common/EnrolledCourseCard";

const enrollment = {
	_id: "e1",
	courseId: {
		_id: "c1",
		title: "React Basics",
		slug: "react-basics",
		thumbnailUrl: "https://img.test/x.png",
		instructorName: "Aarav",
		price: 149900,
		currency: "INR",
	},
	createdAt: "2026-06-28T00:00:00.000Z",
};

const renderCard = () =>
	render(
		<MemoryRouter>
			<EnrolledCourseCard enrollment={enrollment as never} />
		</MemoryRouter>,
	);

describe("EnrolledCourseCard", () => {
	beforeEach(() => vi.clearAllMocks());

	it("links to the learn page", () => {
		mockUseCourseProgress.mockReturnValue({ data: undefined });
		renderCard();
		expect(screen.getByRole("link")).toHaveAttribute("href", "/learn/react-basics");
	});

	it("shows 'Start learning' when there is no progress", () => {
		mockUseCourseProgress.mockReturnValue({ data: { data: [] } });
		renderCard();
		expect(screen.getByText("Start learning")).toBeInTheDocument();
	});

	it("shows 'Continue' when the learner has progress", () => {
		mockUseCourseProgress.mockReturnValue({
			data: { data: [{ lessonId: "l1", positionSeconds: 30, completed: false }] },
		});
		renderCard();
		expect(screen.getByText("Continue")).toBeInTheDocument();
	});
});

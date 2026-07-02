//* test/pages/MyCoursesPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockUseMyEnrollments = vi.fn();
vi.mock("@/hooks/useEnrollments", () => ({
	useMyEnrollments: () => mockUseMyEnrollments(),
}));

const mockUseCourseProgress = vi.fn();
vi.mock("@/hooks/useProgress", () => ({
	useCourseProgress: () => mockUseCourseProgress(),
}));

import MyCoursesPage from "@/pages/MyCoursesPage";

const enrollment = (id: string, title: string) => ({
	_id: id,
	courseId: {
		_id: `c-${id}`,
		title,
		slug: title.toLowerCase().replace(/\s+/g, "-"),
		thumbnailUrl: "https://img.test/x.png",
		instructorName: "Aarav",
		price: 149900,
		currency: "INR",
	},
	createdAt: "2026-06-28T00:00:00.000Z",
});

const ok = (data: unknown[]) => ({
	data: { data },
	isLoading: false,
	isError: false,
	refetch: vi.fn(),
});

const renderPage = () =>
	render(
		<MemoryRouter>
			<MyCoursesPage />
		</MemoryRouter>,
	);

describe("MyCoursesPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseMyEnrollments.mockReturnValue(
			ok([enrollment("1", "React Basics")]),
		);
		mockUseCourseProgress.mockReturnValue({ data: undefined });
	});

	it("lists the enrolled courses and links into the LearnPage", () => {
		renderPage();
		expect(screen.getByText("React Basics")).toBeInTheDocument();
		expect(screen.getByText("Enrolled")).toBeInTheDocument();
		expect(screen.getByText("Start learning")).toBeInTheDocument();
		expect(screen.getByRole("link")).toHaveAttribute(
			"href",
			"/learn/react-basics",
		);
	});

	it("shows the empty state with a browse CTA", () => {
		mockUseMyEnrollments.mockReturnValue(ok([]));
		renderPage();
		expect(screen.getByText(/no courses yet/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /browse courses/i }),
		).toHaveAttribute("href", "/courses");
	});

	it("shows the loader while loading", () => {
		mockUseMyEnrollments.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			refetch: vi.fn(),
		});
		renderPage();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows the load-failed state on error", () => {
		mockUseMyEnrollments.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: vi.fn(),
		});
		renderPage();
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});
});

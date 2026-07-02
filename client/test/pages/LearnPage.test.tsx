//* test/pages/LearnPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { courseProgressKey } from "@/lib/queryKeys";

const mockUseGetCourseBySlug = vi.fn();
const mockUseMyEnrollments = vi.fn();
const mockUseCourseProgress = vi.fn();
const mockSave = vi.fn();

vi.mock("@/hooks/useCourses", () => ({
	useGetCourseBySlug: () => mockUseGetCourseBySlug(),
}));
vi.mock("@/hooks/useEnrollments", () => ({
	useMyEnrollments: () => mockUseMyEnrollments(),
}));
vi.mock("@/hooks/useProgress", () => ({
	useCourseProgress: () => mockUseCourseProgress(),
	useSaveProgress: () => ({ mutate: mockSave }),
}));
vi.mock("@/components/media/VideoPlayer", () => ({
	default: ({
		lessonId,
		resumePositionSeconds,
		onReportPosition,
	}: {
		lessonId: string;
		resumePositionSeconds?: number;
		onReportPosition?: (seconds: number, meta: { reason: string }) => void;
	}) => (
		<div
			data-testid="player"
			data-lesson={lessonId}
			data-resume={resumePositionSeconds}
		>
			<button onClick={() => onReportPosition?.(120, { reason: "pause" })}>
				report
			</button>
		</div>
	),
}));

import LearnPage from "@/pages/LearnPage";

const course = {
	_id: "c1",
	title: "Modern React",
	slug: "modern-react",
	description: "A deep dive into React patterns.",
	instructorName: "Priya Nair",
	thumbnailUrl: "https://img.test/x.png",
	price: 0,
	currency: "INR",
	isPublished: true,
	createdAt: "2026-06-01T00:00:00.000Z",
	sections: [
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
	],
};

const enrolled = {
	data: { data: [{ _id: "e1", courseId: { _id: "c1" }, createdAt: "x" }] },
	isLoading: false,
};

// Fresh element tree each call — a shared constant would let React bail out of
// re-rendering the subtree on `rerender`, so a course change wouldn't propagate.
const appRoutes = () => (
	<Routes>
		<Route path="/learn/:courseSlug" element={<LearnPage />} />
		<Route path="/learn/:courseSlug/:lessonId" element={<LearnPage />} />
		<Route path="/courses/:slug" element={<div>course detail</div>} />
	</Routes>
);

const renderLearn = (path = "/learn/modern-react") => {
	const queryClient = new QueryClient();
	const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
	const view = render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[path]}>{appRoutes()}</MemoryRouter>
		</QueryClientProvider>,
	);
	return { invalidateSpy, ...view };
};

describe("LearnPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseGetCourseBySlug.mockReturnValue({
			data: { data: course },
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
		mockUseMyEnrollments.mockReturnValue(enrolled);
		mockUseCourseProgress.mockReturnValue({ data: { data: [] } });
	});

	it("redirects a non-enrolled user to the course detail page", () => {
		mockUseMyEnrollments.mockReturnValue({ data: { data: [] }, isLoading: false });
		renderLearn();
		expect(screen.getByText("course detail")).toBeInTheDocument();
		expect(screen.queryByTestId("player")).not.toBeInTheDocument();
	});

	it("renders the player and the Overview description for an enrolled user", () => {
		renderLearn();
		expect(screen.getByTestId("player")).toBeInTheDocument();
		expect(
			screen.getByText("A deep dive into React patterns."),
		).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
	});

	it("resumes the current lesson from its saved position", () => {
		mockUseCourseProgress.mockReturnValue({
			data: { data: [{ lessonId: "l1", positionSeconds: 90, completed: false }] },
		});
		renderLearn();
		expect(screen.getByTestId("player")).toHaveAttribute("data-resume", "90");
	});

	it("defaults to the first not-completed lesson", () => {
		mockUseCourseProgress.mockReturnValue({
			data: { data: [{ lessonId: "l1", positionSeconds: 120, completed: true }] },
		});
		renderLearn();
		expect(screen.getByTestId("player")).toHaveAttribute("data-lesson", "l2");
	});

	it("waits for progress before auto-picking the resume lesson (no lesson in URL)", () => {
		// Real timing: the course resolves before the progress query, so on the first
		// render progress is still pending. The page must not latch/render a lesson
		// yet — otherwise a returning learner is dropped onto lesson 1.
		mockUseCourseProgress.mockReturnValue({ data: undefined, isLoading: true });
		renderLearn();
		expect(screen.queryByTestId("player")).not.toBeInTheDocument();
	});

	it("uses the lesson from the URL even while progress is still loading", () => {
		mockUseCourseProgress.mockReturnValue({ data: undefined, isLoading: true });
		renderLearn("/learn/modern-react/l2");
		expect(screen.getByTestId("player")).toHaveAttribute("data-lesson", "l2");
	});

	it("saves position and invalidates the course-progress query", async () => {
		const { invalidateSpy } = renderLearn();
		await userEvent.click(screen.getByRole("button", { name: "report" }));
		expect(mockSave).toHaveBeenCalledWith(
			{ lessonId: "l1", payload: { positionSeconds: 120 } },
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		);
		const [, options] = mockSave.mock.calls[0];
		options.onSuccess();
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: courseProgressKey("c1"),
		});
	});

	it("marks the current lesson row with aria-current and links lessons", () => {
		renderLearn();
		const currentRow = screen.getByRole("link", { current: true });
		expect(currentRow).toHaveTextContent("Intro");
		expect(screen.getByRole("link", { name: /Components/ })).toHaveAttribute(
			"href",
			"/learn/modern-react/l2",
		);
	});

	// Fix #3 — a failed enrollments query must not fall through to an empty list
	// (which would wrongly bounce an enrolled learner); show a retry state.
	it("shows a retry state and does not redirect when enrollments fail to load", async () => {
		const refetchEnrollments = vi.fn();
		mockUseMyEnrollments.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: refetchEnrollments,
		});
		renderLearn();

		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText("Couldn't load your course")).toBeInTheDocument();
		expect(screen.queryByTestId("player")).not.toBeInTheDocument();
		expect(screen.queryByText("course detail")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Try again/i }));
		expect(refetchEnrollments).toHaveBeenCalledTimes(1);
	});

	// Fix #4 — a lesson id in the URL that isn't part of the course must surface a
	// not-found state, not silently swap to lesson 1.
	it("shows a not-found state for a lesson id absent from the course", () => {
		renderLearn("/learn/modern-react/does-not-exist");
		expect(screen.getByText("Lesson not found")).toBeInTheDocument();
		expect(screen.queryByTestId("player")).not.toBeInTheDocument();
	});

	// Fix #5 — the resume latch is keyed by course, so reusing the component
	// instance across a course change re-initializes to the new course's resume.
	it("re-initializes the latched resume lesson when the course changes", () => {
		const courseA = {
			...course,
			_id: "cA",
			slug: "course-a",
			sections: [
				{
					_id: "sa",
					courseId: "cA",
					title: "A",
					order: 0,
					lessons: [
						{ _id: "a1", sectionId: "sa", courseId: "cA", title: "A1", order: 0, isPreview: true, duration: 100 },
						{ _id: "a2", sectionId: "sa", courseId: "cA", title: "A2", order: 1, isPreview: false, duration: 100 },
					],
				},
			],
		};
		const courseB = {
			...course,
			_id: "cB",
			slug: "course-b",
			sections: [
				{
					_id: "sb",
					courseId: "cB",
					title: "B",
					order: 0,
					lessons: [
						{ _id: "b1", sectionId: "sb", courseId: "cB", title: "B1", order: 0, isPreview: true, duration: 100 },
						{ _id: "b2", sectionId: "sb", courseId: "cB", title: "B2", order: 1, isPreview: false, duration: 100 },
					],
				},
			],
		};

		// Course A resolved with a1 completed → resume latches on a2.
		mockUseGetCourseBySlug.mockReturnValue({
			data: { data: courseA },
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
		mockUseMyEnrollments.mockReturnValue({
			data: { data: [{ _id: "e1", courseId: { _id: "cA" } }] },
			isLoading: false,
		});
		mockUseCourseProgress.mockReturnValue({
			data: { data: [{ lessonId: "a1", positionSeconds: 50, completed: true }] },
		});

		const queryClient = new QueryClient();
		const { rerender } = render(
			<QueryClientProvider client={queryClient}>
				<MemoryRouter initialEntries={["/learn/course-a"]}>
					{appRoutes()}
				</MemoryRouter>
			</QueryClientProvider>,
		);
		expect(screen.getByTestId("player")).toHaveAttribute("data-lesson", "a2");

		// Same component instance now sees course B (no progress) → resume = b1.
		mockUseGetCourseBySlug.mockReturnValue({
			data: { data: courseB },
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
		mockUseMyEnrollments.mockReturnValue({
			data: { data: [{ _id: "e2", courseId: { _id: "cB" } }] },
			isLoading: false,
		});
		mockUseCourseProgress.mockReturnValue({ data: { data: [] } });

		rerender(
			<QueryClientProvider client={queryClient}>
				<MemoryRouter initialEntries={["/learn/course-a"]}>
					{appRoutes()}
				</MemoryRouter>
			</QueryClientProvider>,
		);
		expect(screen.getByTestId("player")).toHaveAttribute("data-lesson", "b1");
	});
});

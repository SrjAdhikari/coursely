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

const renderLearn = (path = "/learn/modern-react") => {
	const queryClient = new QueryClient();
	const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
	render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[path]}>
				<Routes>
					<Route path="/learn/:courseSlug" element={<LearnPage />} />
					<Route path="/learn/:courseSlug/:lessonId" element={<LearnPage />} />
					<Route path="/courses/:slug" element={<div>course detail</div>} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);
	return { invalidateSpy };
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
});

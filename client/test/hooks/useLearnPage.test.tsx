//* test/hooks/useLearnPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Auto-advance navigates via react-router's useNavigate — spy on it.
const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }));
vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return { ...actual, useNavigate: () => navigateSpy };
});

vi.mock("@/api/courses.api", () => ({
	getCourseBySlug: vi.fn(),
	listCourses: vi.fn(),
	getCourse: vi.fn(),
	createCourse: vi.fn(),
	updateCourse: vi.fn(),
	deleteCourse: vi.fn(),
	listPublishedCourses: vi.fn(),
}));
vi.mock("@/api/enrollments.api", () => ({
	getMyEnrollments: vi.fn(),
	listEnrollments: vi.fn(),
}));
vi.mock("@/api/progress.api", () => ({
	getCourseProgress: vi.fn(),
	saveLessonProgress: vi.fn(),
}));

import { getCourseBySlug } from "@/api/courses.api";
import { getMyEnrollments } from "@/api/enrollments.api";
import { getCourseProgress, saveLessonProgress } from "@/api/progress.api";
import { useLearnPage } from "@/hooks/useLearnPage";

const lesson = (id: string, order: number) => ({
	_id: id,
	sectionId: "s1",
	courseId: "course-1",
	title: `Lesson ${id}`,
	order,
	isPreview: false,
	duration: 300,
});

const course = {
	_id: "course-1",
	title: "Test Course",
	slug: "test-course",
	description: "desc",
	instructorName: "Jane",
	price: 0,
	currency: "USD",
	lessonCount: 2,
	totalDuration: 600,
	isPublished: true,
	createdAt: "2026-01-01",
	learningOutcomes: [],
	hasTrailer: false,
	sections: [
		{
			_id: "s1",
			courseId: "course-1",
			title: "Section 1",
			order: 1,
			lessons: [lesson("l1", 1), lesson("l2", 2)],
		},
	],
};

const wrapper = ({ children }: { children: ReactNode }) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

describe("useLearnPage auto-advance", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getCourseBySlug).mockResolvedValue({
			success: true,
			message: "ok",
			data: course,
		});
		vi.mocked(getMyEnrollments).mockResolvedValue({
			success: true,
			message: "ok",
			data: [],
		});
		vi.mocked(getCourseProgress).mockResolvedValue({
			success: true,
			message: "ok",
			data: [],
		});
		vi.mocked(saveLessonProgress).mockResolvedValue({
			success: true,
			message: "ok",
			data: { lessonId: "l1", positionSeconds: 0, completed: false },
		});
	});

	it("navigates to the next lesson when the video reports ended", async () => {
		const { result } = renderHook(() => useLearnPage("test-course", "l1"), {
			wrapper,
		});
		await waitFor(() => expect(result.current.currentLesson?._id).toBe("l1"));

		act(() => result.current.handleReportPosition(300, { reason: "ended" }));

		expect(navigateSpy).toHaveBeenCalledWith("/learn/test-course/l2");
	});

	it("does not navigate when the last lesson ends", async () => {
		const { result } = renderHook(() => useLearnPage("test-course", "l2"), {
			wrapper,
		});
		await waitFor(() => expect(result.current.currentLesson?._id).toBe("l2"));

		act(() => result.current.handleReportPosition(300, { reason: "ended" }));

		expect(navigateSpy).not.toHaveBeenCalled();
	});

	it("advances again when a completed lesson is rewatched later in the session", async () => {
		const { result, rerender } = renderHook(
			({ lessonId }) => useLearnPage("test-course", lessonId),
			{ wrapper, initialProps: { lessonId: "l1" } },
		);
		await waitFor(() => expect(result.current.currentLesson?._id).toBe("l1"));
		act(() => result.current.handleReportPosition(300, { reason: "ended" }));
		expect(navigateSpy).toHaveBeenCalledWith("/learn/test-course/l2");

		// Learner moves to l2, then navigates back to l1 and finishes it again.
		rerender({ lessonId: "l2" });
		await waitFor(() => expect(result.current.currentLesson?._id).toBe("l2"));
		rerender({ lessonId: "l1" });
		await waitFor(() => expect(result.current.currentLesson?._id).toBe("l1"));

		navigateSpy.mockClear();
		act(() => result.current.handleReportPosition(300, { reason: "ended" }));
		expect(navigateSpy).toHaveBeenCalledWith("/learn/test-course/l2");
	});
});

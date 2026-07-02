//* test/hooks/useProgress.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/progress.api", () => ({
	getCourseProgress: vi.fn(),
	saveLessonProgress: vi.fn(),
}));

import { getCourseProgress, saveLessonProgress } from "@/api/progress.api";
import { useCourseProgress, useSaveProgress } from "@/hooks/useProgress";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("progress hooks", () => {
	beforeEach(() => vi.clearAllMocks());

	it("fetches per-course progress", async () => {
		vi.mocked(getCourseProgress).mockResolvedValue({
			success: true,
			message: "ok",
			data: [{ lessonId: "l1", positionSeconds: 12, completed: false }],
		});
		const { result } = renderHook(() => useCourseProgress("c1"), { wrapper });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getCourseProgress).toHaveBeenCalledWith("c1");
		expect(result.current.data?.data[0].positionSeconds).toBe(12);
	});

	it("does not fetch when courseId is empty", () => {
		const { result } = renderHook(() => useCourseProgress(""), { wrapper });
		expect(result.current.fetchStatus).toBe("idle");
		expect(getCourseProgress).not.toHaveBeenCalled();
	});

	it("saves progress via the bare mutation", async () => {
		vi.mocked(saveLessonProgress).mockResolvedValue({
			success: true,
			message: "ok",
			data: { lessonId: "l1", positionSeconds: 30, completed: false },
		});
		const { result } = renderHook(() => useSaveProgress(), { wrapper });
		result.current.mutate({ lessonId: "l1", payload: { positionSeconds: 30 } });
		// TanStack Query invokes the mutationFn as (variables, context).
		await waitFor(() =>
			expect(saveLessonProgress).toHaveBeenCalledWith(
				{ lessonId: "l1", payload: { positionSeconds: 30 } },
				expect.any(Object),
			),
		);
	});
});

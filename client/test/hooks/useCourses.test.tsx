//* test/hooks/useCourses.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/courses.api", () => ({
	listCourses: vi.fn(),
	getCourse: vi.fn(),
	createCourse: vi.fn(),
	updateCourse: vi.fn(),
	deleteCourse: vi.fn(),
}));

import { listCourses, createCourse } from "@/api/courses.api";
import { useListCourses, useCreateCourse } from "@/hooks/useCourses";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("useCourses", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns the courses list", async () => {
		vi.mocked(listCourses).mockResolvedValue({
			success: true,
			message: "ok",
			data: [{ _id: "1", title: "React" }] as never,
		});
		const { result } = renderHook(() => useListCourses(), { wrapper });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.data[0].title).toBe("React");
	});

	it("calls createCourse on mutate", async () => {
		vi.mocked(createCourse).mockResolvedValue({
			success: true,
			message: "ok",
			data: {} as never,
		});
		const { result } = renderHook(() => useCreateCourse(), { wrapper });
		result.current.mutate({
			title: "React",
			description: "d",
			instructorName: "A",
			thumbnailUrl: "https://x/y.png",
			price: 99900,
		});
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createCourse).toHaveBeenCalledWith(
			expect.objectContaining({ title: "React", price: 99900 }),
			expect.any(Object),
		);
	});
});

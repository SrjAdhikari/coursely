//* test/hooks/useCatalog.test.tsx

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
	listPublishedCourses: vi.fn(),
	getCourseBySlug: vi.fn(),
}));

import { listPublishedCourses, getCourseBySlug } from "@/api/courses.api";
import {
	useListPublishedCourses,
	useGetCourseBySlug,
} from "@/hooks/useCourses";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("public catalog hooks", () => {
	beforeEach(() => vi.clearAllMocks());

	it("lists published courses", async () => {
		vi.mocked(listPublishedCourses).mockResolvedValue({
			success: true,
			message: "ok",
			data: [{ _id: "1", title: "React", slug: "react" }] as never,
		});
		const { result } = renderHook(() => useListPublishedCourses(), { wrapper });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.data[0].slug).toBe("react");
	});

	it("fetches a course by slug", async () => {
		vi.mocked(getCourseBySlug).mockResolvedValue({
			success: true,
			message: "ok",
			data: { _id: "1", slug: "react", sections: [] } as never,
		});
		const { result } = renderHook(() => useGetCourseBySlug("react"), {
			wrapper,
		});
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getCourseBySlug).toHaveBeenCalledWith("react");
	});

	it("does not fetch detail without a slug", () => {
		const { result } = renderHook(() => useGetCourseBySlug(""), { wrapper });
		expect(result.current.fetchStatus).toBe("idle");
		expect(getCourseBySlug).not.toHaveBeenCalled();
	});
});

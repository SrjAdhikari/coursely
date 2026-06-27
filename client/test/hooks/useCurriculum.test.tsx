//* test/hooks/useCurriculum.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/sections.api", () => ({
	createSection: vi.fn(),
	updateSection: vi.fn(),
	deleteSection: vi.fn(),
}));
vi.mock("@/api/lessons.api", () => ({
	createLesson: vi.fn(),
	updateLesson: vi.fn(),
	deleteLesson: vi.fn(),
}));

import { createSection } from "@/api/sections.api";
import { createLesson } from "@/api/lessons.api";
import { useCreateSection, useCreateLesson } from "@/hooks/useCurriculum";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("useCurriculum", () => {
	beforeEach(() => vi.clearAllMocks());

	it("createSection mutation calls the api", async () => {
		vi.mocked(createSection).mockResolvedValue({
			success: true,
			message: "ok",
			data: {} as never,
		});
		const { result } = renderHook(() => useCreateSection(), {
			wrapper,
		});
		result.current.mutate({ courseId: "course1", payload: { title: "Intro" } });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createSection).toHaveBeenCalledWith(
			{ courseId: "course1", payload: { title: "Intro" } },
			expect.any(Object),
		);
	});

	it("createLesson mutation calls the api", async () => {
		vi.mocked(createLesson).mockResolvedValue({
			success: true,
			message: "ok",
			data: {} as never,
		});
		const { result } = renderHook(() => useCreateLesson(), {
			wrapper,
		});
		result.current.mutate({ sectionId: "sec1", payload: { title: "Lesson" } });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createLesson).toHaveBeenCalledWith(
			{ sectionId: "sec1", payload: { title: "Lesson" } },
			expect.any(Object),
		);
	});
});

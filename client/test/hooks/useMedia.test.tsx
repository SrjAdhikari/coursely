//* test/hooks/useMedia.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/media.api", () => ({
	getLessonPlaybackUrl: vi.fn(),
	getCourseTrailerUrl: vi.fn(),
}));

import { getLessonPlaybackUrl, getCourseTrailerUrl } from "@/api/media.api";
import { useLessonPlaybackUrl, useCourseTrailerUrl } from "@/hooks/useMedia";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("useLessonPlaybackUrl", () => {
	beforeEach(() => vi.clearAllMocks());

	it("fetches the playback URL for a lesson", async () => {
		vi.mocked(getLessonPlaybackUrl).mockResolvedValue({
			success: true,
			message: "ok",
			data: { url: "https://r2/get" },
		});
		const { result } = renderHook(() => useLessonPlaybackUrl("l1"), { wrapper });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getLessonPlaybackUrl).toHaveBeenCalledWith("l1");
		expect(result.current.data?.data.url).toBe("https://r2/get");
	});

	it("does not fetch when the lessonId is empty", () => {
		renderHook(() => useLessonPlaybackUrl(""), { wrapper });
		expect(getLessonPlaybackUrl).not.toHaveBeenCalled();
	});
});

describe("useCourseTrailerUrl", () => {
	beforeEach(() => vi.clearAllMocks());

	it("fetches the trailer URL for a slug once enabled", async () => {
		vi.mocked(getCourseTrailerUrl).mockResolvedValue({
			success: true,
			message: "ok",
			data: { url: "https://r2/trailer" },
		});
		const { result } = renderHook(() => useCourseTrailerUrl("react", true), {
			wrapper,
		});
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getCourseTrailerUrl).toHaveBeenCalledWith("react");
		expect(result.current.data?.data.url).toBe("https://r2/trailer");
	});

	it("stays idle until enabled (lazy — no fetch on mount)", () => {
		renderHook(() => useCourseTrailerUrl("react", false), { wrapper });
		expect(getCourseTrailerUrl).not.toHaveBeenCalled();
	});

	it("does not fetch when the slug is empty", () => {
		renderHook(() => useCourseTrailerUrl("", true), { wrapper });
		expect(getCourseTrailerUrl).not.toHaveBeenCalled();
	});
});

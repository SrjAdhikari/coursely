//* test/hooks/useMedia.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/media.api", () => ({ getLessonPlaybackUrl: vi.fn() }));

import { getLessonPlaybackUrl } from "@/api/media.api";
import { useLessonPlaybackUrl } from "@/hooks/useMedia";

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

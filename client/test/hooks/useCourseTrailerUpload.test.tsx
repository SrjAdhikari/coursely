//* test/hooks/useCourseTrailerUpload.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/media.api", () => ({
	createCourseTrailerUploadUrl: vi.fn(),
	setCourseTrailer: vi.fn(),
	uploadToR2: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

import {
	createCourseTrailerUploadUrl,
	setCourseTrailer,
	uploadToR2,
} from "@/api/media.api";
import { toast } from "sonner";
import useCourseTrailerUpload from "@/hooks/useCourseTrailerUpload";

const mp4 = () => new File([new Uint8Array(10)], "t.mp4", { type: "video/mp4" });

const renderTrailerHook = (courseId: string) => {
	const client = new QueryClient();
	const invalidate = vi.spyOn(client, "invalidateQueries");
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	const view = renderHook(() => useCourseTrailerUpload(courseId), { wrapper });
	return { ...view, invalidate };
};

describe("useCourseTrailerUpload", () => {
	beforeEach(() => vi.clearAllMocks());

	it("uploads a trailer, then invalidates the course and toasts", async () => {
		vi.mocked(createCourseTrailerUploadUrl).mockResolvedValue({
			success: true,
			message: "ok",
			data: { uploadUrl: "https://r2/put", trailerKey: "courses/c1/t.mp4" },
		});
		vi.mocked(uploadToR2).mockResolvedValue(undefined);
		vi.mocked(setCourseTrailer).mockResolvedValue({
			success: true,
			message: "ok",
			data: {} as never,
		});

		const { result, invalidate } = renderTrailerHook("c1");
		await act(async () => result.current.start(mp4()));
		await waitFor(() => expect(result.current.status).toBe("done"));

		expect(createCourseTrailerUploadUrl).toHaveBeenCalledWith("c1");
		expect(setCourseTrailer).toHaveBeenCalledWith("c1");
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["courses", "c1"] });
		expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Trailer uploaded");
	});
});

//* test/hooks/useCourseThumbnailUpload.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/media.api", () => ({
	createCourseThumbnailUploadUrl: vi.fn(),
	setCourseThumbnail: vi.fn(),
	uploadToR2: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

import {
	createCourseThumbnailUploadUrl,
	setCourseThumbnail,
	uploadToR2,
} from "@/api/media.api";
import { toast } from "sonner";
import useCourseThumbnailUpload from "@/hooks/useCourseThumbnailUpload";

const png = () =>
	new File([new Uint8Array(10)], "cover.png", { type: "image/png" });

const renderThumbnailHook = (courseId: string) => {
	const client = new QueryClient();
	const invalidate = vi.spyOn(client, "invalidateQueries");
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	const view = renderHook(() => useCourseThumbnailUpload(courseId), { wrapper });
	return { ...view, invalidate };
};

describe("useCourseThumbnailUpload", () => {
	beforeEach(() => vi.clearAllMocks());

	it("uploads a thumbnail, then invalidates the course and toasts", async () => {
		vi.mocked(createCourseThumbnailUploadUrl).mockResolvedValue({
			success: true,
			message: "ok",
			data: { uploadUrl: "https://r2/put", thumbnailKey: "courses/c1/thumbnail" },
		});
		vi.mocked(uploadToR2).mockResolvedValue(undefined);
		vi.mocked(setCourseThumbnail).mockResolvedValue({
			success: true,
			message: "ok",
			data: {} as never,
		});

		const { result, invalidate } = renderThumbnailHook("c1");
		await act(async () => result.current.start(png()));
		await waitFor(() => expect(result.current.status).toBe("done"));

		// The file's own content type is minted and pinned onto the PUT.
		expect(createCourseThumbnailUploadUrl).toHaveBeenCalledWith("c1", "image/png");
		expect(setCourseThumbnail).toHaveBeenCalledWith("c1");
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["courses", "c1"] });
		expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Thumbnail uploaded");
	});
});

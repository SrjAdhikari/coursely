//* test/api/media.api.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/axiosClient", () => ({
	default: { post: vi.fn(), patch: vi.fn(), get: vi.fn() },
}));
vi.mock("axios", () => ({ default: { put: vi.fn() } }));

import axiosClient from "@/config/axiosClient";
import axios from "axios";
import {
	createLessonUploadUrl,
	setLessonVideo,
	getLessonPlaybackUrl,
	createCourseTrailerUploadUrl,
	setCourseTrailer,
	uploadToR2,
} from "@/api/media.api";

const ok = (data: unknown) => ({ data: { success: true, message: "ok", data } });

describe("media.api", () => {
	beforeEach(() => vi.clearAllMocks());

	it("mints a lesson upload URL", async () => {
		vi.mocked(axiosClient.post).mockResolvedValue(
			ok({ uploadUrl: "https://r2/put", videoKey: "k" }),
		);
		const res = await createLessonUploadUrl("l1");
		expect(axiosClient.post).toHaveBeenCalledWith("/admin/lessons/l1/upload-url");
		expect(res.data.uploadUrl).toBe("https://r2/put");
	});

	it("confirms a lesson video with its duration", async () => {
		vi.mocked(axiosClient.patch).mockResolvedValue(ok({ _id: "l1" }));
		await setLessonVideo({ id: "l1", duration: 252 });
		expect(axiosClient.patch).toHaveBeenCalledWith("/admin/lessons/l1/video", {
			duration: 252,
		});
	});

	it("fetches a lesson playback URL", async () => {
		vi.mocked(axiosClient.get).mockResolvedValue(ok({ url: "https://r2/get" }));
		await getLessonPlaybackUrl("l1");
		expect(axiosClient.get).toHaveBeenCalledWith("/lessons/l1/playback-url");
	});

	it("mints + confirms a trailer", async () => {
		vi.mocked(axiosClient.post).mockResolvedValue(
			ok({ uploadUrl: "u", trailerKey: "k" }),
		);
		vi.mocked(axiosClient.patch).mockResolvedValue(ok({ _id: "c1" }));
		await createCourseTrailerUploadUrl("c1");
		await setCourseTrailer("c1");
		expect(axiosClient.post).toHaveBeenCalledWith("/admin/courses/c1/trailer-url");
		expect(axiosClient.patch).toHaveBeenCalledWith("/admin/courses/c1/trailer");
	});

	it("PUTs to R2 with a bare axios call, pinned video/mp4, threading progress", async () => {
		vi.mocked(axios.put).mockResolvedValue({});
		const file = new File(["x"], "v.mp4", { type: "video/mp4" });
		const onProgress = vi.fn();
		await uploadToR2("https://r2/put", file, { onProgress });

		expect(axios.put).toHaveBeenCalledTimes(1);
		const [url, body, config] = vi.mocked(axios.put).mock.calls[0];
		expect(url).toBe("https://r2/put");
		expect(body).toBe(file);
		expect(config?.headers).toEqual({ "Content-Type": "video/mp4" });

		config?.onUploadProgress?.({ loaded: 50, total: 200 } as never);
		expect(onProgress).toHaveBeenCalledWith(25);
	});
});

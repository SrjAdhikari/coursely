//* test/api/progress.api.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/axiosClient", () => ({
	default: { put: vi.fn(), get: vi.fn() },
}));

import axiosClient from "@/config/axiosClient";
import { saveLessonProgress, getCourseProgress } from "@/api/progress.api";

const ok = (data: unknown) => ({ data: { success: true, message: "ok", data } });

describe("progress.api", () => {
	beforeEach(() => vi.clearAllMocks());

	it("PUTs a lesson position to the progress endpoint", async () => {
		vi.mocked(axiosClient.put).mockResolvedValue(
			ok({ lessonId: "l1", positionSeconds: 30, completed: false }),
		);
		const res = await saveLessonProgress({
			lessonId: "l1",
			payload: { positionSeconds: 30 },
		});
		expect(axiosClient.put).toHaveBeenCalledWith("/progress/l1", {
			positionSeconds: 30,
		});
		expect(res.data.completed).toBe(false);
	});

	it("GETs the per-course progress rows", async () => {
		vi.mocked(axiosClient.get).mockResolvedValue(ok([]));
		await getCourseProgress("c1");
		expect(axiosClient.get).toHaveBeenCalledWith("/progress/course/c1");
	});
});

//* test/lib/videoDuration.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readVideoDuration } from "@/lib/videoDuration";

// jsdom implements neither object URLs nor <video> metadata loading, so we
// stub both and drive the element's callbacks by hand.
type FakeVideo = {
	preload: string;
	src: string;
	duration: number;
	onloadedmetadata: (() => void) | null;
	onerror: (() => void) | null;
	removeAttribute: ReturnType<typeof vi.fn>;
	load: ReturnType<typeof vi.fn>;
};

let fakeVideo: FakeVideo;

beforeEach(() => {
	fakeVideo = {
		preload: "",
		src: "",
		duration: NaN,
		onloadedmetadata: null,
		onerror: null,
		removeAttribute: vi.fn(),
		load: vi.fn(),
	};
	vi.spyOn(document, "createElement").mockReturnValue(
		fakeVideo as unknown as HTMLVideoElement,
	);
	vi.stubGlobal("URL", {
		createObjectURL: vi.fn(() => "blob:fake"),
		revokeObjectURL: vi.fn(),
	});
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

const mp4 = () => new File(["x"], "v.mp4", { type: "video/mp4" });

describe("readVideoDuration", () => {
	it("resolves with the metadata duration (raw seconds)", async () => {
		const promise = readVideoDuration(mp4());
		fakeVideo.duration = 123.6;
		fakeVideo.onloadedmetadata?.();
		await expect(promise).resolves.toBe(123.6);
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake");
	});

	it("rejects when the duration is not finite", async () => {
		const promise = readVideoDuration(mp4());
		fakeVideo.duration = Infinity;
		fakeVideo.onloadedmetadata?.();
		await expect(promise).rejects.toThrow();
	});

	it("rejects on a media error", async () => {
		const promise = readVideoDuration(mp4());
		fakeVideo.onerror?.();
		await expect(promise).rejects.toThrow();
	});
});

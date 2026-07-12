//* test/lib/r2.test.ts

import { describe, it, expect } from "vitest";
import {
	lessonVideoKey,
	courseTrailerKey,
	courseThumbnailKey,
	presignGet,
	THUMBNAIL_URL_TTL_SECONDS,
} from "../../src/lib/r2";

describe("r2 key builders", () => {
	it("builds the canonical lesson video key", () => {
		expect(lessonVideoKey("abc123")).toBe("lessons/abc123/source.mp4");
	});

	it("builds the canonical course trailer key", () => {
		expect(courseTrailerKey("xyz789")).toBe("courses/xyz789/trailer.mp4");
	});

	it("builds the canonical (extension-less) course thumbnail key", () => {
		expect(courseThumbnailKey("xyz789")).toBe("courses/xyz789/thumbnail");
	});
});

describe("presignGet TTL", () => {
	it("defaults to the ~1h playback window", async () => {
		const url = await presignGet("courses/x/thumbnail");
		expect(url).toContain("X-Amz-Expires=3600");
	});

	it("honors a custom TTL (e.g. the 7-day thumbnail window)", async () => {
		const url = await presignGet(
			"courses/x/thumbnail",
			THUMBNAIL_URL_TTL_SECONDS,
		);
		expect(THUMBNAIL_URL_TTL_SECONDS).toBe(7 * 24 * 60 * 60);
		expect(url).toContain(`X-Amz-Expires=${THUMBNAIL_URL_TTL_SECONDS}`);
	});
});

//* test/validators/media.validator.test.ts

import { describe, it, expect } from "vitest";
import {
	setLessonVideoSchema,
	createThumbnailUploadUrlSchema,
} from "../../src/validators/media.validator";

describe("setLessonVideoSchema", () => {
	it("accepts a positive integer duration", () => {
		expect(setLessonVideoSchema.safeParse({ duration: 540 }).success).toBe(true);
	});

	it("rejects a missing duration", () => {
		expect(setLessonVideoSchema.safeParse({}).success).toBe(false);
	});

	it("rejects a non-integer duration", () => {
		expect(setLessonVideoSchema.safeParse({ duration: 1.5 }).success).toBe(false);
	});

	it("rejects a zero/negative duration", () => {
		expect(setLessonVideoSchema.safeParse({ duration: 0 }).success).toBe(false);
	});
});

describe("createThumbnailUploadUrlSchema", () => {
	it("accepts png/jpeg/webp content-types", () => {
		for (const contentType of ["image/png", "image/jpeg", "image/webp"]) {
			expect(
				createThumbnailUploadUrlSchema.safeParse({ contentType }).success,
			).toBe(true);
		}
	});

	it("rejects a disallowed content-type (e.g. image/gif or video/mp4)", () => {
		expect(
			createThumbnailUploadUrlSchema.safeParse({ contentType: "image/gif" })
				.success,
		).toBe(false);
		expect(
			createThumbnailUploadUrlSchema.safeParse({ contentType: "video/mp4" })
				.success,
		).toBe(false);
	});

	it("rejects a missing content-type", () => {
		expect(createThumbnailUploadUrlSchema.safeParse({}).success).toBe(false);
	});
});

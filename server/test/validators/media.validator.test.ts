//* test/validators/media.validator.test.ts

import { describe, it, expect } from "vitest";
import { setLessonVideoSchema } from "../../src/validators/media.validator";

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

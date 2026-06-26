//* test/validators/course.validator.test.ts

import { describe, it, expect } from "vitest";
import {
	createCourseSchema,
	createLessonSchema,
} from "../../src/validators/course.validator";
import { updateStudentSchema } from "../../src/validators/student.validator";

describe("course validators", () => {
	it("accepts a valid course and defaults currency + isPublished", () => {
		const parsed = createCourseSchema.parse({
			title: "Intro",
			description: "desc",
			instructorName: "Asha",
			thumbnailUrl: "https://example.com/a.jpg",
			price: 49900,
		});
		expect(parsed.currency).toBe("INR");
		expect(parsed.isPublished).toBe(false);
	});

	it("rejects a negative or non-integer price", () => {
		const base = {
			title: "Intro",
			description: "desc",
			instructorName: "Asha",
			thumbnailUrl: "https://example.com/a.jpg",
		};
		expect(createCourseSchema.safeParse({ ...base, price: -1 }).success).toBe(
			false,
		);
		expect(createCourseSchema.safeParse({ ...base, price: 1.5 }).success).toBe(
			false,
		);
	});

	it("defaults lesson isPreview=false and duration=0", () => {
		const parsed = createLessonSchema.parse({ title: "L1" });
		expect(parsed.isPreview).toBe(false);
		expect(parsed.duration).toBe(0);
	});
});

describe("updateStudentSchema", () => {
	it("requires at least one of role / isActive", () => {
		expect(updateStudentSchema.safeParse({}).success).toBe(false);
		expect(updateStudentSchema.safeParse({ isActive: false }).success).toBe(true);
	});
});

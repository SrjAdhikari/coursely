//* test/validators/course.validator.test.ts

import { describe, it, expect } from "vitest";
import {
	createCourseSchema,
	updateCourseSchema,
	createLessonSchema,
	updateSectionSchema,
	updateLessonSchema,
} from "../../src/validators/course.validator";
import { updateStudentSchema } from "../../src/validators/student.validator";

describe("course validators", () => {
	it("accepts a valid course (currency/isPublished default at the model layer)", () => {
		const parsed = createCourseSchema.parse({
			title: "Intro",
			description: "desc",
			instructorName: "Asha",
			thumbnailUrl: "https://example.com/a.jpg",
			price: 49900,
			category: "Web Development",
		});
		// Defaults live on the model, not the schema, so they're absent here.
		expect(parsed.currency).toBeUndefined();
		expect(parsed.isPublished).toBeUndefined();
	});

	it("rejects a course without a category (required)", () => {
		const withoutCategory = {
			title: "Intro",
			description: "desc",
			instructorName: "Asha",
			thumbnailUrl: "https://example.com/a.jpg",
			price: 49900,
		};
		expect(createCourseSchema.safeParse(withoutCategory).success).toBe(false);
	});

	it("rejects a negative or non-integer price", () => {
		const base = {
			title: "Intro",
			description: "desc",
			instructorName: "Asha",
			thumbnailUrl: "https://example.com/a.jpg",
			category: "Web Development",
		};
		expect(createCourseSchema.safeParse({ ...base, price: -1 }).success).toBe(
			false,
		);
		expect(createCourseSchema.safeParse({ ...base, price: 1.5 }).success).toBe(
			false,
		);
	});

	it("accepts a course without a thumbnailUrl (now optional — set later via upload)", () => {
		const withoutThumbnail = {
			title: "Intro",
			description: "desc",
			instructorName: "Asha",
			price: 49900,
			category: "Web Development",
		};
		expect(createCourseSchema.safeParse(withoutThumbnail).success).toBe(true);
	});

	it("rejects a thumbnailUrl with a non-http(s) scheme", () => {
		const base = {
			title: "Intro",
			description: "desc",
			instructorName: "Asha",
			price: 49900,
			category: "Web Development",
		};
		expect(
			createCourseSchema.safeParse({
				...base,
				thumbnailUrl: "javascript:alert(1)",
			}).success,
		).toBe(false);
		expect(
			createCourseSchema.safeParse({
				...base,
				thumbnailUrl: "https://example.com/a.jpg",
			}).success,
		).toBe(true);
	});

	it("accepts a minimal lesson (order/isPreview/duration default at the model layer)", () => {
		expect(createLessonSchema.safeParse({ title: "L1" }).success).toBe(true);
	});
});

describe("course/section/lesson update schemas", () => {
	it("reject an empty patch ({})", () => {
		expect(updateCourseSchema.safeParse({}).success).toBe(false);
		expect(updateSectionSchema.safeParse({}).success).toBe(false);
		expect(updateLessonSchema.safeParse({}).success).toBe(false);
	});

	it("a partial patch carries only the sent fields (no clobbering)", () => {
		expect(updateCourseSchema.parse({ title: "Renamed Course" })).toEqual({
			title: "Renamed Course",
		});
		expect(updateLessonSchema.parse({ title: "Renamed Lesson" })).toEqual({
			title: "Renamed Lesson",
		});
	});
});

describe("updateStudentSchema", () => {
	it("requires at least one of role / isActive", () => {
		expect(updateStudentSchema.safeParse({}).success).toBe(false);
		expect(updateStudentSchema.safeParse({ isActive: false }).success).toBe(true);
	});
});

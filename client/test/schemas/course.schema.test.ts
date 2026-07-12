//* test/schemas/course.schema.test.ts

import { describe, it, expect } from "vitest";
import {
	courseFormSchema,
	parseLearningOutcomes,
	buildCoursePayload,
} from "@/schemas/course.schema";

const valid = {
	title: "React from Scratch",
	description: "Hooks and state.",
	instructorName: "Asha Rai",
	priceRupees: "999",
	isPublished: false,
	category: "Web Development",
};

describe("courseFormSchema", () => {
	it("accepts a valid course", () => {
		expect(courseFormSchema.safeParse(valid).success).toBe(true);
	});

	it("does not require a thumbnailUrl (it is uploaded on the build page)", () => {
		expect(valid).not.toHaveProperty("thumbnailUrl");
		expect(courseFormSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects a title shorter than 3 characters", () => {
		const r = courseFormSchema.safeParse({ ...valid, title: "Re" });
		expect(r.success).toBe(false);
	});

	it("rejects a non-numeric price", () => {
		const r = courseFormSchema.safeParse({ ...valid, priceRupees: "9.99" });
		expect(r.success).toBe(false);
	});

	it("rejects a blank price (required)", () => {
		const r = courseFormSchema.safeParse({ ...valid, priceRupees: "" });
		expect(r.success).toBe(false);
	});

	it("keeps category and learningOutcomesText on a valid parse", () => {
		const result = courseFormSchema.safeParse({
			...valid,
			category: "Web Development",
			learningOutcomesText: "Build components\nManage state",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.category).toBe("Web Development");
			expect(result.data.learningOutcomesText).toBe(
				"Build components\nManage state",
			);
		}
	});

	it("accepts empty outcomes when a category is present", () => {
		const r = courseFormSchema.safeParse({
			...valid,
			learningOutcomesText: "",
		});
		expect(r.success).toBe(true);
	});

	it("rejects a blank category (required)", () => {
		const r = courseFormSchema.safeParse({ ...valid, category: "   " });
		expect(r.success).toBe(false);
	});

	it("rejects a missing category (required)", () => {
		const withoutCategory = {
			title: "React from Scratch",
			description: "Hooks and state.",
			instructorName: "Asha Rai",
			priceRupees: "999",
			isPublished: false,
		};
		expect(courseFormSchema.safeParse(withoutCategory).success).toBe(false);
	});

	it("rejects a category longer than 60 characters", () => {
		const r = courseFormSchema.safeParse({
			...valid,
			category: "x".repeat(61),
		});
		expect(r.success).toBe(false);
	});

	it("rejects more than 12 learning outcomes", () => {
		const thirteen = Array.from(
			{ length: 13 },
			(_, index) => `Outcome ${index}`,
		).join("\n");
		const r = courseFormSchema.safeParse({
			...valid,
			learningOutcomesText: thirteen,
		});
		expect(r.success).toBe(false);
	});
});

describe("parseLearningOutcomes", () => {
	it("splits on newlines, trims, and drops blank lines", () => {
		const raw = "  Build components  \n\n Manage state \n   \n";
		expect(parseLearningOutcomes(raw)).toEqual([
			"Build components",
			"Manage state",
		]);
	});

	it("returns an empty array for a blank textarea", () => {
		expect(parseLearningOutcomes("   \n  \n")).toEqual([]);
	});
});

describe("buildCoursePayload", () => {
	const formValues = {
		title: "React from Scratch",
		description: "Hooks and state.",
		instructorName: "Asha Rai",
		priceRupees: "999",
		isPublished: false,
		category: "Web Development",
		learningOutcomesText: "Build components\nManage state",
	};

	it("maps rupees to paise, parses outcomes, and keeps the category", () => {
		const payload = buildCoursePayload(formValues);
		expect(payload.price).toBe(99900);
		expect(payload.learningOutcomes).toEqual([
			"Build components",
			"Manage state",
		]);
		expect(payload.category).toBe("Web Development");
	});

	it("always sends the category and an empty outcomes array when none entered", () => {
		const payload = buildCoursePayload({
			...formValues,
			learningOutcomesText: "",
		});
		expect(payload.learningOutcomes).toEqual([]);
		expect(payload.category).toBe("Web Development");
	});
});

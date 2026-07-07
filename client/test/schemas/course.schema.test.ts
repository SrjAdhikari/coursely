//* test/schemas/course.schema.test.ts

import { describe, it, expect } from "vitest";
import {
	courseFormSchema,
	parseLearningOutcomes,
} from "@/schemas/course.schema";

const valid = {
	title: "React from Scratch",
	description: "Hooks and state.",
	instructorName: "Asha Rai",
	thumbnailUrl: "https://cdn.coursely.app/react.png",
	priceRupees: "999",
	isPublished: false,
};

describe("courseFormSchema", () => {
	it("accepts a valid course", () => {
		expect(courseFormSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects a title shorter than 3 characters", () => {
		const r = courseFormSchema.safeParse({ ...valid, title: "Re" });
		expect(r.success).toBe(false);
	});

	it("rejects a non-http(s) thumbnail URL", () => {
		const r = courseFormSchema.safeParse({
			...valid,
			thumbnailUrl: "ftp://x/y.png",
		});
		expect(r.success).toBe(false);
	});

	it("rejects a javascript: scheme thumbnail URL", () => {
		const r = courseFormSchema.safeParse({
			...valid,
			thumbnailUrl: "javascript:alert(1)",
		});
		expect(r.success).toBe(false);
	});

	it("rejects a data: scheme thumbnail URL", () => {
		const r = courseFormSchema.safeParse({
			...valid,
			thumbnailUrl: "data:text/html,<script>alert(1)</script>",
		});
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

	it("accepts an empty category and empty outcomes", () => {
		const r = courseFormSchema.safeParse({
			...valid,
			category: "",
			learningOutcomesText: "",
		});
		expect(r.success).toBe(true);
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

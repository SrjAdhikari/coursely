//* test/schemas/course.schema.test.ts

import { describe, it, expect } from "vitest";
import { courseFormSchema } from "@/schemas/course.schema";

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
});

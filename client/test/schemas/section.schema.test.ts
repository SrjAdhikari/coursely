//* test/schemas/section.schema.test.ts

import { describe, it, expect } from "vitest";
import { sectionFormSchema } from "@/schemas/section.schema";

describe("sectionFormSchema", () => {
	it("accepts a title with an optional blank order", () => {
		expect(
			sectionFormSchema.safeParse({ title: "Getting Started", order: "" })
				.success,
		).toBe(true);
	});
	it("accepts a whole-number order", () => {
		expect(
			sectionFormSchema.safeParse({ title: "Intro", order: "3" }).success,
		).toBe(true);
	});
	it("rejects an empty title", () => {
		expect(sectionFormSchema.safeParse({ title: "", order: "" }).success).toBe(
			false,
		);
	});
	it("rejects a non-numeric order", () => {
		expect(
			sectionFormSchema.safeParse({ title: "Intro", order: "x" }).success,
		).toBe(false);
	});
});

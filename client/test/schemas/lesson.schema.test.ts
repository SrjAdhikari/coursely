//* test/schemas/lesson.schema.test.ts

import { describe, it, expect } from "vitest";
import { lessonFormSchema } from "@/schemas/lesson.schema";

describe("lessonFormSchema", () => {
	it("accepts a full valid lesson", () => {
		expect(
			lessonFormSchema.safeParse({
				title: "Intro",
				order: "0",
				duration: "240",
				isPreview: true,
			}).success,
		).toBe(true);
	});
	it("allows blank optional numeric fields", () => {
		expect(
			lessonFormSchema.safeParse({
				title: "Intro",
				order: "",
				duration: "",
				isPreview: false,
			}).success,
		).toBe(true);
	});
	it("rejects an empty title", () => {
		expect(
			lessonFormSchema.safeParse({
				title: "",
				order: "",
				duration: "",
				isPreview: false,
			}).success,
		).toBe(false);
	});
	it("rejects a non-numeric duration", () => {
		expect(
			lessonFormSchema.safeParse({
				title: "Intro",
				order: "",
				duration: "9:60",
				isPreview: false,
			}).success,
		).toBe(false);
	});
});

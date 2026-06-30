//* test/schemas/lesson.schema.test.ts

import { describe, it, expect } from "vitest";
import { lessonFormSchema } from "@/schemas/lesson.schema";

describe("lessonFormSchema", () => {
	it("does not include a duration field (set via video upload)", () => {
		const parsed = lessonFormSchema.parse({
			title: "Intro",
			order: "0",
			isPreview: false,
		});
		expect(parsed).not.toHaveProperty("duration");
	});
});

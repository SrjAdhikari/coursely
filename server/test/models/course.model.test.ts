//* test/models/course.model.test.ts

import { describe, it, expect } from "vitest";
import Course from "../../src/models/course.model";

const BASE = {
	title: "React Basics",
	slug: "react-basics",
	description: "Learn React",
	instructorName: "Asha Rai",
	thumbnailUrl: "https://example.com/thumb.jpg",
	price: 49900,
};

describe("Course model", () => {
	it("defaults currency=INR and isPublished=false", async () => {
		const course = await Course.create(BASE);
		expect(course.currency).toBe("INR");
		expect(course.isPublished).toBe(false);
		expect(course.trailerKey).toBeUndefined();
	});

	it("enforces a unique slug", async () => {
		await Course.init(); // ensure the unique index is built before relying on it
		await Course.create(BASE);
		await expect(
			Course.create({ ...BASE, title: "Another" }),
		).rejects.toMatchObject({ code: 11000 });
	});

	it("rejects unknown fields (strict: throw)", async () => {
		await expect(
			// @ts-expect-error — deliberately passing an unknown field; strict:"throw" must reject it at runtime
			Course.create({ ...BASE, slug: "x", bogus: true }),
		).rejects.toThrow();
	});
});

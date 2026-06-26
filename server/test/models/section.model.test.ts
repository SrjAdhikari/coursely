//* test/models/section.model.test.ts

import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import Section from "../../src/models/section.model";

describe("Section model", () => {
	it("requires courseId and title; defaults order=0", async () => {
		const courseId = new Types.ObjectId();
		const section = await Section.create({ courseId, title: "Intro" });
		expect(section.courseId.toString()).toBe(courseId.toString());
		expect(section.order).toBe(0);
	});

	it("rejects a missing courseId", async () => {
		await expect(Section.create({ title: "Orphan" })).rejects.toThrow();
	});
});

//* test/models/lesson.model.test.ts

import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import Lesson from "../../src/models/lesson.model";

describe("Lesson model", () => {
	it("defaults isPreview=false, duration=0 and leaves videoKey unset", async () => {
		const lesson = await Lesson.create({
			sectionId: new Types.ObjectId(),
			courseId: new Types.ObjectId(),
			title: "Lesson 1",
		});
		expect(lesson.isPreview).toBe(false);
		expect(lesson.duration).toBe(0);
		expect(lesson.videoKey).toBeUndefined();
	});

	it("requires sectionId and courseId", async () => {
		await expect(Lesson.create({ title: "Orphan" })).rejects.toThrow();
	});

	it("rejects a negative order", async () => {
		await expect(
			Lesson.create({
				sectionId: new Types.ObjectId(),
				courseId: new Types.ObjectId(),
				title: "Lesson 1",
				order: -1,
			}),
		).rejects.toThrow();
	});
});

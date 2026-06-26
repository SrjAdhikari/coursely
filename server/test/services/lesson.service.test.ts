//* test/services/lesson.service.test.ts

import { describe, it, expect } from "vitest";
import mongoose from "mongoose";

import {
	createLesson,
	updateLesson,
	deleteLesson,
} from "../../src/services/lesson.service";
import Lesson from "../../src/models/lesson.model";
import {
	createTestCourse,
	createTestSection,
	createTestLesson,
} from "../helpers/factories";

describe("lesson.service", () => {
	it("creates a lesson, denormalizing courseId from the section", async () => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		const lesson = await createLesson(section._id.toString(), {
			title: "Lesson 1",
			order: 0,
			isPreview: true,
		});
		expect(lesson.courseId.toString()).toBe(course._id.toString());
		expect(lesson.sectionId.toString()).toBe(section._id.toString());
		expect(lesson.isPreview).toBe(true);
	});

	it("404s creating a lesson under a missing section", async () => {
		await expect(
			createLesson(new mongoose.Types.ObjectId().toString(), {
				title: "X",
				order: 0,
			}),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "SECTION_NOT_FOUND" });
	});

	it("updates a lesson", async () => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		const lesson = await createTestLesson(section._id, course._id);
		const updated = await updateLesson(lesson._id.toString(), {
			title: "Renamed",
		});
		expect(updated.title).toBe("Renamed");
	});

	it("404s updating a missing lesson", async () => {
		await expect(
			updateLesson(new mongoose.Types.ObjectId().toString(), { title: "X" }),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "LESSON_NOT_FOUND" });
	});

	it("deletes a lesson", async () => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		const lesson = await createTestLesson(section._id, course._id);
		await deleteLesson(lesson._id.toString());
		expect(await Lesson.findById(lesson._id)).toBeNull();
	});

	it("404s deleting a missing lesson", async () => {
		await expect(
			deleteLesson(new mongoose.Types.ObjectId().toString()),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "LESSON_NOT_FOUND" });
	});
});

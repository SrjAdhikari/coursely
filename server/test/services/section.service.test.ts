//* test/services/section.service.test.ts

import { describe, it, expect } from "vitest";
import mongoose from "mongoose";

import {
	createSection,
	updateSection,
	deleteSection,
} from "../../src/services/section.service";
import Section from "../../src/models/section.model";
import Lesson from "../../src/models/lesson.model";
import {
	createTestCourse,
	createTestSection,
	createTestLesson,
} from "../helpers/factories";

describe("section.service", () => {
	it("creates a section under an existing course", async () => {
		const course = await createTestCourse();
		const section = await createSection(course._id.toString(), {
			title: "Module 1",
			order: 0,
		});
		expect(section.courseId.toString()).toBe(course._id.toString());
		expect(section.title).toBe("Module 1");
	});

	it("404s creating a section under a missing course", async () => {
		await expect(
			createSection(new mongoose.Types.ObjectId().toString(), {
				title: "X",
				order: 0,
			}),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "COURSE_NOT_FOUND" });
	});

	it("updates a section", async () => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		const updated = await updateSection(section._id.toString(), {
			title: "Renamed",
		});
		expect(updated.title).toBe("Renamed");
	});

	it("404s updating a missing section", async () => {
		await expect(
			updateSection(new mongoose.Types.ObjectId().toString(), { title: "X" }),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "SECTION_NOT_FOUND" });
	});

	it("deletes a section and cascades its lessons", async () => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		await createTestLesson(section._id, course._id);

		await deleteSection(section._id.toString());

		expect(await Section.findById(section._id)).toBeNull();
		expect(await Lesson.countDocuments({ sectionId: section._id })).toBe(0);
	});

	it("404s deleting a missing section", async () => {
		await expect(
			deleteSection(new mongoose.Types.ObjectId().toString()),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "SECTION_NOT_FOUND" });
	});
});

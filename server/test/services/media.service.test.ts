//* test/services/media.service.test.ts

import { describe, it, expect, vi } from "vitest";
import mongoose from "mongoose";

vi.mock("../../src/lib/r2", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../src/lib/r2")>();
	return {
		...actual,
		presignPut: vi.fn(async (key: string) => `https://r2.test/put/${key}`),
		presignGet: vi.fn(async (key: string) => `https://r2.test/get/${key}`),
	};
});

import {
	createLessonUploadUrl,
	setLessonVideo,
	createCourseTrailerUploadUrl,
	setCourseTrailer,
} from "../../src/services/media.service";
import {
	createTestCourse,
	createTestSection,
	createTestLesson,
} from "../helpers/factories";

const seedLesson = async () => {
	const course = await createTestCourse();
	const section = await createTestSection(course._id);
	const lesson = await createTestLesson(section._id, course._id);
	return { course, lesson };
};

describe("media.service — admin upload/confirm", () => {
	it("createLessonUploadUrl returns a presigned PUT + canonical key", async () => {
		const { lesson } = await seedLesson();
		const id = lesson._id.toString();
		const { uploadUrl, videoKey } = await createLessonUploadUrl(id);
		expect(videoKey).toBe(`lessons/${id}/source.mp4`);
		expect(uploadUrl).toBe(`https://r2.test/put/lessons/${id}/source.mp4`);
	});

	it("createLessonUploadUrl 404s a missing lesson", async () => {
		await expect(
			createLessonUploadUrl(new mongoose.Types.ObjectId().toString()),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "LESSON_NOT_FOUND" });
	});

	it("setLessonVideo stores the canonical key + duration", async () => {
		const { lesson } = await seedLesson();
		const id = lesson._id.toString();
		const updated = await setLessonVideo(id, 540);
		expect(updated.videoKey).toBe(`lessons/${id}/source.mp4`);
		expect(updated.duration).toBe(540);
	});

	it("setLessonVideo 404s a missing lesson", async () => {
		await expect(
			setLessonVideo(new mongoose.Types.ObjectId().toString(), 540),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "LESSON_NOT_FOUND" });
	});

	it("createCourseTrailerUploadUrl returns a presigned PUT + canonical key", async () => {
		const course = await createTestCourse();
		const id = course._id.toString();
		const { uploadUrl, trailerKey } = await createCourseTrailerUploadUrl(id);
		expect(trailerKey).toBe(`courses/${id}/trailer.mp4`);
		expect(uploadUrl).toBe(`https://r2.test/put/courses/${id}/trailer.mp4`);
	});

	it("setCourseTrailer stores the canonical trailer key", async () => {
		const course = await createTestCourse();
		const id = course._id.toString();
		const updated = await setCourseTrailer(id);
		expect(updated.trailerKey).toBe(`courses/${id}/trailer.mp4`);
	});
});

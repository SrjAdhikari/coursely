//* test/services/media.service.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";

vi.mock("../../src/lib/r2", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../src/lib/r2")>();
	return {
		...actual,
		presignPut: vi.fn(async (key: string) => `https://r2.test/put/${key}`),
		presignGet: vi.fn(async (key: string) => `https://r2.test/get/${key}`),
	};
});
vi.mock("../../src/services/enrollment.service", () => ({
	isEnrolled: vi.fn(),
}));

import {
	createLessonUploadUrl,
	setLessonVideo,
	createCourseTrailerUploadUrl,
	setCourseTrailer,
	getLessonPlaybackUrl,
	getCourseTrailerUrl,
} from "../../src/services/media.service";
import { isEnrolled } from "../../src/services/enrollment.service";
import {
	createTestCourse,
	createTestSection,
	createTestLesson,
} from "../helpers/factories";

const mockedIsEnrolled = vi.mocked(isEnrolled);

beforeEach(() => {
	mockedIsEnrolled.mockReset();
});

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

describe("getLessonPlaybackUrl", () => {
	const seedPlayableLesson = async (overrides: Record<string, unknown> = {}) => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		return createTestLesson(section._id, course._id, {
			videoKey: "lessons/x/source.mp4",
			...overrides,
		});
	};

	it("mints a URL for a preview lesson without a user", async () => {
		const lesson = await seedPlayableLesson({ isPreview: true });
		const { url } = await getLessonPlaybackUrl(lesson._id.toString());
		expect(url).toBe("https://r2.test/get/lessons/x/source.mp4");
		expect(mockedIsEnrolled).not.toHaveBeenCalled();
	});

	it("401s a paid lesson with no user", async () => {
		const lesson = await seedPlayableLesson({ isPreview: false });
		await expect(
			getLessonPlaybackUrl(lesson._id.toString()),
		).rejects.toMatchObject({ statusCode: 401, errorCode: "UNAUTHORIZED_ACCESS" });
	});

	it("403s a paid lesson for a non-enrolled user", async () => {
		mockedIsEnrolled.mockResolvedValue(false);
		const lesson = await seedPlayableLesson({ isPreview: false });
		await expect(
			getLessonPlaybackUrl(
				lesson._id.toString(),
				new mongoose.Types.ObjectId().toString(),
			),
		).rejects.toMatchObject({ statusCode: 403, errorCode: "NOT_ENROLLED" });
	});

	it("mints a URL for a paid lesson when the user is enrolled", async () => {
		mockedIsEnrolled.mockResolvedValue(true);
		const lesson = await seedPlayableLesson({ isPreview: false });
		const { url } = await getLessonPlaybackUrl(
			lesson._id.toString(),
			new mongoose.Types.ObjectId().toString(),
		);
		expect(url).toBe("https://r2.test/get/lessons/x/source.mp4");
	});

	it("404s a lesson that has no video yet", async () => {
		const lesson = await seedPlayableLesson({ isPreview: true, videoKey: undefined });
		await expect(
			getLessonPlaybackUrl(lesson._id.toString()),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "VIDEO_NOT_FOUND" });
	});

	it("404s a missing lesson", async () => {
		await expect(
			getLessonPlaybackUrl(new mongoose.Types.ObjectId().toString()),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "LESSON_NOT_FOUND" });
	});
});

describe("getCourseTrailerUrl", () => {
	it("mints an ungated URL for a published course with a trailer", async () => {
		const course = await createTestCourse({
			slug: "with-trailer",
			trailerKey: "courses/x/trailer.mp4",
		});
		const { url } = await getCourseTrailerUrl(course.slug);
		expect(url).toBe("https://r2.test/get/courses/x/trailer.mp4");
	});

	it("404s a published course with no trailer", async () => {
		const course = await createTestCourse({ slug: "no-trailer" });
		await expect(getCourseTrailerUrl(course.slug)).rejects.toMatchObject({
			statusCode: 404,
			errorCode: "TRAILER_NOT_FOUND",
		});
	});

	it("404s an unpublished/unknown course slug", async () => {
		await expect(getCourseTrailerUrl("ghost")).rejects.toMatchObject({
			statusCode: 404,
			errorCode: "COURSE_NOT_FOUND",
		});
	});
});

//* test/services/course.service.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import mongoose from "mongoose";

import Course from "../../src/models/course.model";
import {
	listPublishedCourses,
	getCourseBySlug,
	createCourse,
	updateCourse,
	deleteCourse,
	listAllCourses,
	getCourseById,
} from "../../src/services/course.service";
import {
	createTestCourse,
	createTestSection,
	createTestLesson,
} from "../helpers/factories";

beforeAll(async () => {
	await Course.init(); // ensure the $text index exists before the ?q= search
});

describe("course.service — public reads", () => {
	describe("listPublishedCourses", () => {
		it("returns only published courses and never the trailerKey", async () => {
			await createTestCourse({
				title: "Published",
				slug: "published",
				trailerKey: "courses/published/trailer.mp4",
			});
			await createTestCourse({
				title: "Draft",
				slug: "draft",
				isPublished: false,
				trailerKey: "courses/x/trailer.mp4",
			});

			const courses = await listPublishedCourses();
			expect(courses).toHaveLength(1);
			expect(courses[0]!.title).toBe("Published");
			expect(
				(courses[0] as unknown as Record<string, unknown>).trailerKey,
			).toBeUndefined();
		});

		it("filters by ?q= text search", async () => {
			await createTestCourse({ title: "Mastering React", slug: "react" });
			await createTestCourse({ title: "Vue for Beginners", slug: "vue" });

			const hits = await listPublishedCourses("react");
			expect(hits).toHaveLength(1);
			expect(hits[0]!.title).toBe("Mastering React");
		});

		it("treats a whitespace-only q as no search", async () => {
			await createTestCourse({ title: "Alpha", slug: "alpha" });
			await createTestCourse({ title: "Beta", slug: "beta" });

			const courses = await listPublishedCourses("   ");
			expect(courses).toHaveLength(2);
		});
	});

	describe("getCourseBySlug", () => {
		it("returns the course with ordered curriculum and isPreview, never video keys", async () => {
			const course = await createTestCourse({
				slug: "node-course",
				trailerKey: "courses/node-course/trailer.mp4",
			});

			// Insert sections out of order (order:1 first) so the test fails if
			// the service stops sorting by `order`.
			await createTestSection(course._id, {
				order: 1,
				title: "Second Section",
			});
			const firstSection = await createTestSection(course._id, {
				order: 0,
				title: "First Section",
			});

			// Likewise insert the first section's lessons out of order.
			await createTestLesson(firstSection._id, course._id, {
				title: "Second lesson",
				order: 1,
			});
			await createTestLesson(firstSection._id, course._id, {
				title: "Preview lesson",
				order: 0,
				isPreview: true,
				videoKey: "lessons/a/source.mp4",
			});

			const detail = await getCourseBySlug("node-course");
			expect(detail.slug).toBe("node-course");
			expect((detail as unknown as Record<string, unknown>).trailerKey).toBeUndefined();

			// Sections come back ascending by `order`.
			expect(detail.sections).toHaveLength(2);
			expect(detail.sections[0]!.order).toBe(0);
			expect(detail.sections[1]!.order).toBe(1);

			// The first section's lessons come back ascending by `order`.
			const lessons = detail.sections[0]!.lessons;
			expect(lessons).toHaveLength(2);
			expect(lessons[0]!.order).toBe(0);
			expect(lessons[1]!.order).toBe(1);

			const lesson = lessons[0]!;
			expect(lesson.isPreview).toBe(true);
			expect((lesson as unknown as Record<string, unknown>).videoKey).toBeUndefined();
		});

		it("flags hasTrailer true and never leaks the trailerKey when a trailer exists", async () => {
			await createTestCourse({
				slug: "with-trailer",
				trailerKey: "courses/with-trailer/trailer.mp4",
			});

			const detail = await getCourseBySlug("with-trailer");
			expect(detail.hasTrailer).toBe(true);
			expect(
				(detail as unknown as Record<string, unknown>).trailerKey,
			).toBeUndefined();
		});

		it("flags hasTrailer false when the course has no trailer", async () => {
			await createTestCourse({ slug: "no-trailer" });

			const detail = await getCourseBySlug("no-trailer");
			expect(detail.hasTrailer).toBe(false);
		});

		it("404s for an unknown or unpublished slug", async () => {
			await createTestCourse({ slug: "hidden", isPublished: false });
			await expect(getCourseBySlug("hidden")).rejects.toMatchObject({
				statusCode: 404,
				errorCode: "COURSE_NOT_FOUND",
			});
		});
	});
});

const NEW_COURSE = {
	title: "Intro to TypeScript",
	description: "Types everywhere",
	instructorName: "Asha Rai",
	thumbnailUrl: "https://example.com/ts.jpg",
	price: 49900,
	currency: "INR" as const,
	isPublished: false,
	category: "Web Development",
};

describe("course.service — admin course CRUD", () => {
	it("creates a course with a generated unique slug", async () => {
		const a = await createCourse(NEW_COURSE);
		const b = await createCourse(NEW_COURSE); // same title → collision
		expect(a.slug).toBe("intro-to-typescript");
		expect(b.slug).toBe("intro-to-typescript-2");
	});

	it("updates a course but never mutates its slug", async () => {
		const course = await createTestCourse({ slug: "stable" });
		const updated = await updateCourse(course._id.toString(), {
			title: "Renamed",
		});
		expect(updated.title).toBe("Renamed");
		expect(updated.slug).toBe("stable");
	});

	it("404s updating a missing course", async () => {
		await expect(
			updateCourse(new mongoose.Types.ObjectId().toString(), { title: "X" }),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "COURSE_NOT_FOUND" });
	});

	it("hard-deletes a course with no enrollments, cascading sections + lessons", async () => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		await createTestLesson(section._id, course._id);

		await deleteCourse(course._id.toString());

		expect(await Course.findById(course._id)).toBeNull();
		const sectionCount = await mongoose.connection
			.collection("sections")
			.countDocuments({ courseId: course._id });
		const lessonCount = await mongoose.connection
			.collection("lessons")
			.countDocuments({ courseId: course._id });
		expect(sectionCount).toBe(0);
		expect(lessonCount).toBe(0);
	});

	it("409s deleting a course that has enrollments (unpublish instead)", async () => {
		const course = await createTestCourse();
		await mongoose.connection
			.collection("enrollments")
			.insertOne({ courseId: course._id, userId: new mongoose.Types.ObjectId() });

		await expect(deleteCourse(course._id.toString())).rejects.toMatchObject({
			statusCode: 409,
			errorCode: "COURSE_HAS_ENROLLMENTS",
		});
		expect(await Course.findById(course._id)).not.toBeNull();
	});
});

describe("course.service — admin reads", () => {
	describe("listAllCourses", () => {
		it("returns both published and draft courses, newest first", async () => {
			const published = await createTestCourse({ isPublished: true });
			// Draft created after published → should be result[0] (newest first).
			const draft = await createTestCourse({ isPublished: false });

			const result = await listAllCourses();
			// At minimum 2 courses in this describe block's scope.
			expect(result.length).toBeGreaterThanOrEqual(2);

			// Verify draft is present.
			const slugs = result.map((c) => c.slug);
			expect(slugs).toContain(published.slug);
			expect(slugs).toContain(draft.slug);

			// Newest first: draft was inserted last so it comes before published.
			const draftIdx = result.findIndex((c) => c.slug === draft.slug);
			const publishedIdx = result.findIndex((c) => c.slug === published.slug);
			expect(draftIdx).toBeLessThan(publishedIdx);
		});
	});

	describe("getCourseById", () => {
		it("returns a draft course with full curriculum and exposes videoKey", async () => {
			const course = await createTestCourse({ isPublished: false });
			const section = await createTestSection(course._id);
			await createTestLesson(section._id, course._id, {
				videoKey: "lessons/x/source.mp4",
			});

			const detail = await getCourseById(course._id.toString());

			expect(detail.isPublished).toBe(false);
			expect(detail.sections).toHaveLength(1);
			expect(detail.sections[0]!.lessons).toHaveLength(1);
			// Admin sees videoKey — must be present.
			expect(detail.sections[0]!.lessons[0]!.videoKey).toBe("lessons/x/source.mp4");
			// Lesson is linked to the course.
			expect(detail.sections[0]!.lessons[0]!.courseId.toString()).toBe(
				course._id.toString(),
			);
		});

		it("404s for an unknown id", async () => {
			await expect(
				getCourseById(new mongoose.Types.ObjectId().toString()),
			).rejects.toMatchObject({ statusCode: 404, errorCode: "COURSE_NOT_FOUND" });
		});
	});
});

describe("course.service — category & learning outcomes", () => {
	it("persists category and learningOutcomes on create", async () => {
		const created = await createCourse({
			...NEW_COURSE,
			category: "Web Development",
			learningOutcomes: ["Build a REST API", "Deploy to production"],
		});
		expect(created.category).toBe("Web Development");
		expect(created.learningOutcomes).toEqual([
			"Build a REST API",
			"Deploy to production",
		]);
	});

	it("defaults learningOutcomes to an empty array when omitted", async () => {
		const created = await createCourse(NEW_COURSE);
		expect(created.learningOutcomes).toEqual([]);
	});

	it("leaves category and learningOutcomes intact on a partial update that omits them", async () => {
		const course = await createTestCourse({
			category: "Design",
			learningOutcomes: ["Grid systems"],
		});
		const updated = await updateCourse(course._id.toString(), {
			title: "Renamed",
		});
		expect(updated.title).toBe("Renamed");
		expect(updated.category).toBe("Design");
		expect(updated.learningOutcomes).toEqual(["Grid systems"]);
	});
});

describe("course.service — lesson stats aggregation", () => {
	it("folds lessonCount and totalDuration into each listed course", async () => {
		const withLessons = await createTestCourse({ slug: "with-lessons" });
		const firstSection = await createTestSection(withLessons._id, { order: 0 });
		const secondSection = await createTestSection(withLessons._id, { order: 1 });
		await createTestLesson(firstSection._id, withLessons._id, { order: 0, duration: 60 });
		await createTestLesson(firstSection._id, withLessons._id, { order: 1, duration: 120 });
		// A video-less lesson contributes to the count but adds 0 seconds.
		await createTestLesson(secondSection._id, withLessons._id, { order: 0, duration: 0 });
		await createTestCourse({ slug: "no-lessons" });

		const courses = await listPublishedCourses();
		const enriched = courses.find((course) => course.slug === "with-lessons")!;
		const empty = courses.find((course) => course.slug === "no-lessons")!;

		expect(enriched.lessonCount).toBe(3);
		expect(enriched.totalDuration).toBe(180);
		expect(empty.lessonCount).toBe(0);
		expect(empty.totalDuration).toBe(0);
	});

	it("totals lessonCount and totalDuration on the detail in memory", async () => {
		const course = await createTestCourse({ slug: "detail-stats" });
		const section = await createTestSection(course._id, { order: 0 });
		await createTestLesson(section._id, course._id, { order: 0, duration: 90 });
		await createTestLesson(section._id, course._id, { order: 1, duration: 30 });

		const detail = await getCourseBySlug("detail-stats");
		expect(detail.lessonCount).toBe(2);
		expect(detail.totalDuration).toBe(120);
	});
});

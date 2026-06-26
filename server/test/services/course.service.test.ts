//* test/services/course.service.test.ts

import { describe, it, expect, beforeAll } from "vitest";

import Course from "../../src/models/course.model";
import {
	listPublishedCourses,
	getCourseBySlug,
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
			await createTestCourse({ title: "Published", slug: "published" });
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
	});

	describe("getCourseBySlug", () => {
		it("returns the course with ordered curriculum and isPreview, never video keys", async () => {
			const course = await createTestCourse({ slug: "node-course" });

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

		it("404s for an unknown or unpublished slug", async () => {
			await createTestCourse({ slug: "hidden", isPublished: false });
			await expect(getCourseBySlug("hidden")).rejects.toMatchObject({
				statusCode: 404,
				errorCode: "COURSE_NOT_FOUND",
			});
		});
	});
});

//* test/routes/course.routes.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

import app from "../../src/app";
import Course from "../../src/models/course.model";
import {
	createTestCourse,
	createTestSection,
	createTestLesson,
} from "../helpers/factories";

beforeAll(async () => {
	await Course.init(); // ensure the $text index exists before the ?q= search
});

describe("GET /api/courses", () => {
	it("lists only published courses", async () => {
		await createTestCourse({ title: "Live", slug: "live" });
		await createTestCourse({ title: "Draft", slug: "draft", isPublished: false });

		const res = await request(app).get("/api/courses");
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toHaveLength(1);
		expect(res.body.data[0].title).toBe("Live");
	});

	it("supports ?q= text search", async () => {
		await createTestCourse({ title: "Mastering React", slug: "react" });
		await createTestCourse({ title: "Vue Basics", slug: "vue" });

		const res = await request(app).get("/api/courses").query({ q: "react" });
		expect(res.status).toBe(200);
		expect(res.body.data).toHaveLength(1);
		expect(res.body.data[0].title).toBe("Mastering React");
	});
});

describe("GET /api/courses/:slug", () => {
	it("returns curriculum with isPreview and no video keys", async () => {
		const course = await createTestCourse({
			slug: "detail",
			trailerKey: "courses/detail/trailer.mp4",
		});
		const section = await createTestSection(course._id);
		await createTestLesson(section._id, course._id, {
			isPreview: true,
			videoKey: "lessons/x/source.mp4",
		});

		const res = await request(app).get("/api/courses/detail");
		expect(res.status).toBe(200);
		expect(res.body.data.sections[0].lessons[0].isPreview).toBe(true);
		expect(res.body.data.sections[0].lessons[0].videoKey).toBeUndefined();
		expect(res.body.data.trailerKey).toBeUndefined();
	});

	it("404s an unknown slug", async () => {
		const res = await request(app).get("/api/courses/nope");
		expect(res.status).toBe(404);
		expect(res.body.error.code).toBe("COURSE_NOT_FOUND");
	});
});

describe("public course response enrichment", () => {
	it("carries category, lessonCount, and totalDuration on the list", async () => {
		const course = await createTestCourse({ slug: "enriched", category: "Web Development" });
		const section = await createTestSection(course._id);
		await createTestLesson(section._id, course._id, { duration: 90 });

		const res = await request(app).get("/api/courses");
		expect(res.status).toBe(200);
		const item = res.body.data.find((candidate: { slug: string }) => candidate.slug === "enriched");
		expect(item.category).toBe("Web Development");
		expect(item.lessonCount).toBe(1);
		expect(item.totalDuration).toBe(90);
	});

	it("carries category, counts, and learningOutcomes on the detail (never videoKey)", async () => {
		const course = await createTestCourse({
			slug: "enriched-detail",
			category: "Backend",
			learningOutcomes: ["Design a schema", "Write an API"],
		});
		const section = await createTestSection(course._id);
		await createTestLesson(section._id, course._id, { duration: 120, isPreview: true, videoKey: "lessons/x/source.mp4" });

		const res = await request(app).get("/api/courses/enriched-detail");
		expect(res.status).toBe(200);
		expect(res.body.data.category).toBe("Backend");
		expect(res.body.data.learningOutcomes).toEqual(["Design a schema", "Write an API"]);
		expect(res.body.data.lessonCount).toBe(1);
		expect(res.body.data.totalDuration).toBe(120);
		expect(res.body.data.sections[0].lessons[0].videoKey).toBeUndefined();
	});
});

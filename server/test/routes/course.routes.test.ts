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

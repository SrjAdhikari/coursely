//* test/routes/media.public.routes.test.ts

import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../../src/lib/r2", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../src/lib/r2")>();
	return {
		...actual,
		presignGet: vi.fn(async (key: string) => `https://r2.test/get/${key}`),
		presignPut: vi.fn(async (key: string) => `https://r2.test/put/${key}`),
	};
});

import app from "../../src/app";
import {
	createTestUser,
	createTestCourse,
	createTestSection,
	createTestLesson,
	createTestEnrollment,
} from "../helpers/factories";

describe("GET /api/lessons/:id/playback-url", () => {
	it("mints a URL for a preview lesson without auth", async () => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		const lesson = await createTestLesson(section._id, course._id, {
			isPreview: true,
			videoKey: "lessons/preview/source.mp4",
		});

		const res = await request(app).get(
			`/api/lessons/${lesson._id.toString()}/playback-url`,
		);
		expect(res.status).toBe(200);
		expect(res.body.data.url).toContain("https://r2.test/get/");
	});

	it("401s anon, 403s a non-enrolled student, then mints once enrolled", async () => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		const lesson = await createTestLesson(section._id, course._id, {
			isPreview: false,
			videoKey: "lessons/paid/source.mp4",
		});
		const path = `/api/lessons/${lesson._id.toString()}/playback-url`;

		// anonymous → 401
		const anon = await request(app).get(path);
		expect(anon.status).toBe(401);

		// student, not enrolled → 403
		const student = await createTestUser({
			email: "learner@example.com",
			password: "Password@123",
		});
		const agent = request.agent(app);
		await agent
			.post("/api/auth/login")
			.send({ email: "learner@example.com", password: "Password@123" });
		const notEnrolled = await agent.get(path);
		expect(notEnrolled.status).toBe(403);
		expect(notEnrolled.body.error.code).toBe("NOT_ENROLLED");

		// enrolled → 200
		await createTestEnrollment(student._id, course._id);
		const enrolled = await agent.get(path);
		expect(enrolled.status).toBe(200);
		expect(enrolled.body.data.url).toContain("https://r2.test/get/");
	});

	it("lets an admin play a lesson in a draft (unpublished) course", async () => {
		const course = await createTestCourse({
			slug: "draft-route",
			isPublished: false,
		});
		const section = await createTestSection(course._id);
		const lesson = await createTestLesson(section._id, course._id, {
			isPreview: false,
			videoKey: "lessons/draft/source.mp4",
		});
		const agent = request.agent(app);
		await createTestUser({
			email: "admin2@example.com",
			password: "Password@123",
			role: "admin",
		});
		await agent
			.post("/api/auth/login")
			.send({ email: "admin2@example.com", password: "Password@123" });
		const res = await agent.get(
			`/api/lessons/${lesson._id.toString()}/playback-url`,
		);
		expect(res.status).toBe(200);
		expect(res.body.data.url).toContain("https://r2.test/get/");
	});
});

describe("GET /api/courses/:slug/trailer-url", () => {
	it("mints an ungated URL when the course has a trailer", async () => {
		const course = await createTestCourse({
			slug: "with-trailer",
			trailerKey: "courses/with-trailer/trailer.mp4",
		});
		const res = await request(app).get(`/api/courses/${course.slug}/trailer-url`);
		expect(res.status).toBe(200);
		expect(res.body.data.url).toContain("https://r2.test/get/");
	});

	it("404s a course with no trailer", async () => {
		const course = await createTestCourse({ slug: "no-trailer" });
		const res = await request(app).get(`/api/courses/${course.slug}/trailer-url`);
		expect(res.status).toBe(404);
		expect(res.body.error.code).toBe("TRAILER_NOT_FOUND");
	});
});

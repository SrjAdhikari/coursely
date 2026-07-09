//* test/routes/media.admin.routes.test.ts

import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../../src/lib/r2", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../src/lib/r2")>();
	return {
		...actual,
		presignPut: vi.fn(async (key: string) => `https://r2.test/put/${key}`),
		presignGet: vi.fn(async (key: string) => `https://r2.test/get/${key}`),
		objectExists: vi.fn(async () => true),
	};
});

import app from "../../src/app";
import envConfig from "../../src/constants/env";
import {
	createTestUser,
	createTestCourse,
	createTestSection,
	createTestLesson,
} from "../helpers/factories";

const { APP_ORIGIN } = envConfig;

const adminAgent = async () => {
	const agent = request.agent(app).set("Origin", APP_ORIGIN);
	await createTestUser({
		email: "admin@example.com",
		password: "Password@123",
		role: "admin",
	});
	await agent
		.post("/api/auth/login")
		.send({ email: "admin@example.com", password: "Password@123" });
	return agent;
};

describe("admin media routes — authz", () => {
	it("401s unauthenticated and 403s a student on upload-url", async () => {
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		const lesson = await createTestLesson(section._id, course._id);
		const path = `/api/admin/lessons/${lesson._id.toString()}/upload-url`;

		const unauth = await request(app).post(path);
		expect(unauth.status).toBe(401);

		await createTestUser({
			email: "student@example.com",
			password: "Password@123",
			role: "student",
		});
		const studentAgent = request.agent(app).set("Origin", APP_ORIGIN);
		await studentAgent
			.post("/api/auth/login")
			.send({ email: "student@example.com", password: "Password@123" });
		const forbidden = await studentAgent.post(path);
		expect(forbidden.status).toBe(403);
	});
});

describe("admin media flow", () => {
	it("mints upload URLs and stores keys for a lesson video and a course trailer", async () => {
		const agent = await adminAgent();
		const course = await createTestCourse();
		const section = await createTestSection(course._id);
		const lesson = await createTestLesson(section._id, course._id);
		const lessonId = lesson._id.toString();
		const courseId = course._id.toString();

		// Lesson video — presign PUT
		const upload = await agent.post(`/api/admin/lessons/${lessonId}/upload-url`);
		expect(upload.status).toBe(200);
		expect(upload.body.data.videoKey).toBe(`lessons/${lessonId}/source.mp4`);
		expect(upload.body.data.uploadUrl).toContain("https://r2.test/put/");

		// Lesson video — confirm
		const confirm = await agent
			.patch(`/api/admin/lessons/${lessonId}/video`)
			.send({ duration: 540 });
		expect(confirm.status).toBe(200);
		expect(confirm.body.data.videoKey).toBe(`lessons/${lessonId}/source.mp4`);
		expect(confirm.body.data.duration).toBe(540);

		// Lesson video — bad body
		const bad = await agent
			.patch(`/api/admin/lessons/${lessonId}/video`)
			.send({ duration: -1 });
		expect(bad.status).toBe(400);
		expect(bad.body.error.code).toBe("VALIDATION_ERROR");

		// Trailer — presign PUT
		const trailerUpload = await agent.post(
			`/api/admin/courses/${courseId}/trailer-url`,
		);
		expect(trailerUpload.status).toBe(200);
		expect(trailerUpload.body.data.trailerKey).toBe(
			`courses/${courseId}/trailer.mp4`,
		);

		// Trailer — confirm
		const trailerConfirm = await agent.patch(
			`/api/admin/courses/${courseId}/trailer`,
		);
		expect(trailerConfirm.status).toBe(200);
		expect(trailerConfirm.body.data.trailerKey).toBe(
			`courses/${courseId}/trailer.mp4`,
		);
	});
});

//* test/routes/admin.routes.test.ts

import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../../src/app";
import { createTestUser, createTestCourse } from "../helpers/factories";

// Log a user in via the real auth flow and return an authenticated agent.
const adminAgent = async () => {
	const agent = request.agent(app);
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

const studentAgent = async () => {
	const agent = request.agent(app);
	await createTestUser({
		email: "student@example.com",
		password: "Password@123",
		role: "student",
	});
	await agent
		.post("/api/auth/login")
		.send({ email: "student@example.com", password: "Password@123" });
	return agent;
};

const COURSE_BODY = {
	title: "Admin Course",
	description: "desc",
	instructorName: "Asha",
	thumbnailUrl: "https://example.com/a.jpg",
	price: 49900,
};

describe("admin authz", () => {
	it("401s an unauthenticated request", async () => {
		const res = await request(app).post("/api/admin/courses").send(COURSE_BODY);
		expect(res.status).toBe(401);
		expect(res.body.error.code).toBe("UNAUTHORIZED_ACCESS");
	});

	it("403s a non-admin (student)", async () => {
		const agent = await studentAgent();
		const res = await agent.post("/api/admin/courses").send(COURSE_BODY);
		expect(res.status).toBe(403);
		expect(res.body.error.code).toBe("INSUFFICIENT_ROLE");
	});
});

describe("admin course → section → lesson flow", () => {
	it("an admin creates a course, a section, then a lesson", async () => {
		const agent = await adminAgent();

		const course = await agent.post("/api/admin/courses").send(COURSE_BODY);
		expect(course.status).toBe(201);
		const courseId = course.body.data._id;
		expect(course.body.data.slug).toBe("admin-course");

		const section = await agent
			.post(`/api/admin/courses/${courseId}/sections`)
			.send({ title: "Module 1", order: 0 });
		expect(section.status).toBe(201);
		const sectionId = section.body.data._id;

		const lesson = await agent
			.post(`/api/admin/sections/${sectionId}/lessons`)
			.send({ title: "Lesson 1", order: 0, isPreview: true });
		expect(lesson.status).toBe(201);
		expect(lesson.body.data.courseId).toBe(courseId);
	});

	it("returns 400 VALIDATION_ERROR for a bad course body", async () => {
		const agent = await adminAgent();
		const res = await agent
			.post("/api/admin/courses")
			.send({ title: "x", price: -5 });
		expect(res.status).toBe(400);
		expect(res.body.error.code).toBe("VALIDATION_ERROR");
	});

	it("409s deleting a course that has enrollments", async () => {
		const agent = await adminAgent();
		const course = await createTestCourse();
		const mongoose = (await import("mongoose")).default;
		await mongoose.connection
			.collection("enrollments")
			.insertOne({ courseId: course._id, userId: new mongoose.Types.ObjectId() });

		const res = await agent.delete(`/api/admin/courses/${course._id.toString()}`);
		expect(res.status).toBe(409);
		expect(res.body.error.code).toBe("COURSE_HAS_ENROLLMENTS");
	});

	it("PATCH /courses/:id updates only the provided field and does not clobber others", async () => {
		const agent = await adminAgent();
		const course = await createTestCourse({ isPublished: true });

		const res = await agent
			.patch(`/api/admin/courses/${course._id.toString()}`)
			.send({ title: "Renamed Only" });

		expect(res.status).toBe(200);
		expect(res.body.data.title).toBe("Renamed Only");
		expect(res.body.data.isPublished).toBe(true); // not clobbered by the undefined rebuild
	});

	it("hard-deletes a course with no enrollments", async () => {
		const agent = await adminAgent();
		const course = await createTestCourse();

		const res = await agent.delete(`/api/admin/courses/${course._id.toString()}`);
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
	});

	it("404s patching an unknown course id", async () => {
		const agent = await adminAgent();
		const mongoose = (await import("mongoose")).default;

		const res = await agent
			.patch(`/api/admin/courses/${new mongoose.Types.ObjectId().toString()}`)
			.send({ title: "Nope" });
		expect(res.status).toBe(404);
		expect(res.body.error.code).toBe("COURSE_NOT_FOUND");
	});
});

describe("admin student management", () => {
	it("lists students and toggles isActive", async () => {
		const agent = await adminAgent();
		const student = await createTestUser({ email: "managed@example.com" });

		const list = await agent.get("/api/admin/students");
		expect(list.status).toBe(200);
		expect(
			list.body.data.some(
				(s: { email: string }) => s.email === "managed@example.com",
			),
		).toBe(true);

		const patch = await agent
			.patch(`/api/admin/students/${student._id.toString()}`)
			.send({ isActive: false });
		expect(patch.status).toBe(200);
		expect(patch.body.data.isActive).toBe(false);
	});

	it("404s getting an unknown student id", async () => {
		const agent = await adminAgent();
		const mongoose = (await import("mongoose")).default;

		const res = await agent.get(
			`/api/admin/students/${new mongoose.Types.ObjectId().toString()}`,
		);
		expect(res.status).toBe(404);
		expect(res.body.error.code).toBe("STUDENT_NOT_FOUND");
	});
});

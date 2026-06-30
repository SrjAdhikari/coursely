//* test/routes/enrollment.routes.test.ts

import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../../src/app";
import {
	createTestUser,
	createTestCourse,
	createTestEnrollment,
} from "../helpers/factories";

const PASSWORD = "Password@123";

const loginAgent = async (role: "student" | "admin", email: string) => {
	const agent = request.agent(app);
	const user = await createTestUser({ email, password: PASSWORD, role });
	await agent.post("/api/auth/login").send({ email, password: PASSWORD });
	const authedSession = { agent, user };
	return authedSession;
};

describe("GET /api/enrollments/me", () => {
	it("401s an unauthenticated request", async () => {
		const res = await request(app).get("/api/enrollments/me");
		expect(res.status).toBe(401);
	});

	it("returns only the caller's enrollments with the course populated", async () => {
		const { agent, user } = await loginAgent("student", "me@example.com");
		const other = await createTestUser({ email: "other@example.com" });
		const courseA = await createTestCourse({ slug: "a", title: "Mine A" });
		const courseB = await createTestCourse({ slug: "b", title: "Theirs B" });
		await createTestEnrollment(user._id, courseA._id);
		await createTestEnrollment(other._id, courseB._id);

		const res = await agent.get("/api/enrollments/me");
		expect(res.status).toBe(200);
		expect(res.body.data).toHaveLength(1);
		expect(res.body.data[0].courseId.title).toBe("Mine A");
	});
});

describe("GET /api/admin/enrollments", () => {
	it("403s a student", async () => {
		const { agent } = await loginAgent("student", "stu@example.com");
		const res = await agent.get("/api/admin/enrollments");
		expect(res.status).toBe(403);
	});

	it("returns a paginated page for an admin", async () => {
		const { agent } = await loginAgent("admin", "admin@example.com");
		const buyer = await createTestUser({ email: "buyer@example.com" });
		const courseA = await createTestCourse({ slug: "a" });
		const courseB = await createTestCourse({ slug: "b" });
		await createTestEnrollment(buyer._id, courseA._id);
		await createTestEnrollment(buyer._id, courseB._id);

		const res = await agent.get("/api/admin/enrollments").query({ page: 1, limit: 1 });
		expect(res.status).toBe(200);
		expect(res.body.data.items).toHaveLength(1);
		expect(res.body.data.pagination).toEqual({
			page: 1,
			limit: 1,
			total: 2,
			totalPages: 2,
		});
	});
});

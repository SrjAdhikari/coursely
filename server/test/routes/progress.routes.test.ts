//* test/routes/progress.routes.test.ts

import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import request from "supertest";

import app from "../../src/app";
import Progress from "../../src/models/progress.model";
import {
	createTestUser,
	createTestLesson,
	createTestEnrollment,
} from "../helpers/factories";

const PASSWORD = "Password@123";

// Established route-test convention: a supertest agent that carries the auth
// cookie set by a real POST /api/auth/login (no hand-signed cookies).
const loginStudent = async (email: string) => {
	const agent = request.agent(app);
	const user = await createTestUser({ email, password: PASSWORD, role: "student" });
	await agent.post("/api/auth/login").send({ email, password: PASSWORD });
	return { agent, user };
};

const seedLesson = (courseId: Types.ObjectId, duration = 100) =>
	createTestLesson(new Types.ObjectId(), courseId, { duration });

describe("progress routes", () => {
	describe("PUT /api/progress/:lessonId", () => {
		it("upserts progress and derives completion for an enrolled user", async () => {
			const { agent, user } = await loginStudent("learner1@test.dev");
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 100);
			await createTestEnrollment(user._id, courseId);

			const response = await agent
				.put(`/api/progress/${lesson._id}`)
				.send({ positionSeconds: 95 });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.positionSeconds).toBe(95);
			expect(response.body.data.completed).toBe(true);
		});

		it("rejects a malformed lessonId with 400", async () => {
			const { agent } = await loginStudent("learner2@test.dev");

			const response = await agent
				.put("/api/progress/not-a-valid-id")
				.send({ positionSeconds: 10 });

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("rejects a negative positionSeconds with 400", async () => {
			const { agent, user } = await loginStudent("learner3@test.dev");
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId);
			await createTestEnrollment(user._id, courseId);

			const response = await agent
				.put(`/api/progress/${lesson._id}`)
				.send({ positionSeconds: -5 });

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("returns 404 when the lesson does not exist", async () => {
			const { agent } = await loginStudent("learner4@test.dev");

			const response = await agent
				.put(`/api/progress/${new Types.ObjectId()}`)
				.send({ positionSeconds: 10 });

			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe("LESSON_NOT_FOUND");
		});

		it("returns 403 when the user is not enrolled", async () => {
			const { agent } = await loginStudent("learner5@test.dev");
			const lesson = await seedLesson(new Types.ObjectId());

			const response = await agent
				.put(`/api/progress/${lesson._id}`)
				.send({ positionSeconds: 10 });

			expect(response.status).toBe(403);
			expect(response.body.error.code).toBe("NOT_ENROLLED");
		});
	});

	describe("GET /api/progress/course/:courseId", () => {
		it("returns the caller's own progress rows for the course", async () => {
			const { agent, user } = await loginStudent("learner6@test.dev");
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId);
			await createTestEnrollment(user._id, courseId);
			await Progress.create({
				userId: user._id,
				lessonId: lesson._id,
				courseId,
				positionSeconds: 42,
				completed: false,
			});

			const response = await agent.get(`/api/progress/course/${courseId}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0].positionSeconds).toBe(42);
		});

		it("returns 403 when the user is not enrolled", async () => {
			const { agent } = await loginStudent("learner7@test.dev");

			const response = await agent.get(
				`/api/progress/course/${new Types.ObjectId()}`,
			);

			expect(response.status).toBe(403);
			expect(response.body.error.code).toBe("NOT_ENROLLED");
		});

		it("does not leak another user's progress (IDOR)", async () => {
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId);

			const owner = await createTestUser({ email: "owner@test.dev" });
			await createTestEnrollment(owner._id, courseId);
			await Progress.create({
				userId: owner._id,
				lessonId: lesson._id,
				courseId,
				positionSeconds: 88,
				completed: true,
			});

			const { agent, user: attacker } = await loginStudent("attacker@test.dev");
			await createTestEnrollment(attacker._id, courseId);

			const response = await agent.get(`/api/progress/course/${courseId}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual([]);
		});
	});
});

//* test/services/progress.service.test.ts

import { describe, it, expect } from "vitest";
import { Types } from "mongoose";

import {
	saveProgress,
	getCourseProgress,
} from "../../src/services/progress.service";
import Progress from "../../src/models/progress.model";
import { createTestLesson, createTestEnrollment } from "../helpers/factories";

const seedLesson = (courseId: Types.ObjectId, duration = 100) =>
	createTestLesson(new Types.ObjectId(), courseId, { duration });

const enroll = (userId: Types.ObjectId, courseId: Types.ObjectId) =>
	createTestEnrollment(userId, courseId);

describe("progress.service", () => {
	describe("saveProgress", () => {
		it("does not complete below 95%", async () => {
			const userId = new Types.ObjectId();
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 100);
			await enroll(userId, courseId);

			const row = await saveProgress(userId.toString(), lesson._id.toString(), 94);
			expect(row?.completed).toBe(false);
			expect(row?.positionSeconds).toBe(94);
		});

		it("completes at exactly 95%", async () => {
			const userId = new Types.ObjectId();
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 100);
			await enroll(userId, courseId);

			const row = await saveProgress(userId.toString(), lesson._id.toString(), 95);
			expect(row?.completed).toBe(true);
			expect(row?.completedAt).toBeInstanceOf(Date);
		});

		it("never treats a zero-duration lesson as complete", async () => {
			const userId = new Types.ObjectId();
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 0);
			await enroll(userId, courseId);

			const row = await saveProgress(userId.toString(), lesson._id.toString(), 999);
			expect(row?.completed).toBe(false);
		});

		it("keeps completion sticky when the learner rewinds", async () => {
			const userId = new Types.ObjectId();
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 100);
			await enroll(userId, courseId);

			await saveProgress(userId.toString(), lesson._id.toString(), 96);
			const rewound = await saveProgress(userId.toString(), lesson._id.toString(), 10);
			expect(rewound?.completed).toBe(true);
			expect(rewound?.positionSeconds).toBe(10);
		});

		it("stamps completedAt only on the first false→true transition", async () => {
			const userId = new Types.ObjectId();
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 100);
			await enroll(userId, courseId);

			const first = await saveProgress(userId.toString(), lesson._id.toString(), 96);
			const again = await saveProgress(userId.toString(), lesson._id.toString(), 100);
			expect(again?.completedAt?.getTime()).toBe(first?.completedAt?.getTime());
		});

		it("keeps completed + completedAt sticky when a later save has a lower position", async () => {
			const userId = new Types.ObjectId();
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 100);
			await enroll(userId, courseId);

			const completedRow = await saveProgress(userId.toString(), lesson._id.toString(), 96);
			const laterRow = await saveProgress(userId.toString(), lesson._id.toString(), 10);

			expect(laterRow?.completed).toBe(true);
			expect(laterRow?.completedAt?.getTime()).toBe(completedRow?.completedAt?.getTime());
			// Pipeline updates still receive Mongoose timestamps.
			expect(laterRow?.updatedAt).toBeInstanceOf(Date);
		});

		it("upserts a single row per user+lesson", async () => {
			const userId = new Types.ObjectId();
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 100);
			await enroll(userId, courseId);

			await saveProgress(userId.toString(), lesson._id.toString(), 10);
			await saveProgress(userId.toString(), lesson._id.toString(), 20);
			const count = await Progress.countDocuments({
				userId,
				lessonId: lesson._id,
			});
			expect(count).toBe(1);
		});

		it("404s when the lesson does not exist", async () => {
			const userId = new Types.ObjectId();
			await expect(
				saveProgress(userId.toString(), new Types.ObjectId().toString(), 10),
			).rejects.toMatchObject({ statusCode: 404, errorCode: "LESSON_NOT_FOUND" });
		});

		it("403s when the user is not enrolled", async () => {
			const userId = new Types.ObjectId();
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 100);
			await expect(
				saveProgress(userId.toString(), lesson._id.toString(), 10),
			).rejects.toMatchObject({ statusCode: 403, errorCode: "NOT_ENROLLED" });
		});
	});

	describe("getCourseProgress", () => {
		it("returns only the caller's own rows, scoped to the course (IDOR)", async () => {
			const courseId = new Types.ObjectId();
			const lesson = await seedLesson(courseId, 100);

			const owner = new Types.ObjectId();
			const attacker = new Types.ObjectId();
			await enroll(owner, courseId);
			await enroll(attacker, courseId);
			await Progress.create({
				userId: owner,
				lessonId: lesson._id,
				courseId,
				positionSeconds: 42,
				completed: false,
			});

			const ownerRows = await getCourseProgress(owner.toString(), courseId.toString());
			const attackerRows = await getCourseProgress(
				attacker.toString(),
				courseId.toString(),
			);

			expect(ownerRows).toHaveLength(1);
			expect(attackerRows).toEqual([]);
		});

		it("403s when the user is not enrolled", async () => {
			const userId = new Types.ObjectId();
			await expect(
				getCourseProgress(userId.toString(), new Types.ObjectId().toString()),
			).rejects.toMatchObject({ statusCode: 403, errorCode: "NOT_ENROLLED" });
		});
	});
});

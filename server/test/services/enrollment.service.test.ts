//* test/services/enrollment.service.test.ts

import { describe, it, expect } from "vitest";
import mongoose from "mongoose";

import { isEnrolled } from "../../src/services/enrollment.service";
import { createTestEnrollment } from "../helpers/factories";

describe("isEnrolled", () => {
	it("returns true when an enrollment exists", async () => {
		const userId = new mongoose.Types.ObjectId();
		const courseId = new mongoose.Types.ObjectId();
		await createTestEnrollment(userId, courseId);
		expect(await isEnrolled(userId.toString(), courseId.toString())).toBe(true);
	});

	it("returns false when no enrollment exists", async () => {
		expect(
			await isEnrolled(
				new mongoose.Types.ObjectId().toString(),
				new mongoose.Types.ObjectId().toString(),
			),
		).toBe(false);
	});
});

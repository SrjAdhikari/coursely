//* test/models/enrollment.model.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import mongoose from "mongoose";

import Enrollment from "../../src/models/enrollment.model";

beforeAll(async () => {
	await Enrollment.init(); // build the unique compound index before the dup test
});

describe("Enrollment model", () => {
	it("rejects a duplicate {userId, courseId}", async () => {
		const userId = new mongoose.Types.ObjectId();
		const courseId = new mongoose.Types.ObjectId();
		await Enrollment.create({ userId, courseId });
		await expect(Enrollment.create({ userId, courseId })).rejects.toThrow();
	});

	it("allows the same user in a different course", async () => {
		const userId = new mongoose.Types.ObjectId();
		await Enrollment.create({ userId, courseId: new mongoose.Types.ObjectId() });
		await expect(
			Enrollment.create({ userId, courseId: new mongoose.Types.ObjectId() }),
		).resolves.toBeDefined();
	});
});

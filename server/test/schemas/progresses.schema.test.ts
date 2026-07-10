//* test/schemas/progresses.schema.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import mongoose, { Types } from "mongoose";

import Progress from "../../src/models/progress.model";
import progressesSchema from "../../src/schemas/progresses.schema";
import { applyValidator } from "./applyValidator";

const collectionName = Progress.collection.collectionName;

// Timestamps and completedAt are intentionally omitted — the pipeline upsert
// may not stamp them, so they must be optional in the validator.
const validProgress = () => ({
	_id: new Types.ObjectId(),
	userId: new Types.ObjectId(),
	lessonId: new Types.ObjectId(),
	courseId: new Types.ObjectId(),
	positionSeconds: 0,
	completed: false,
	__v: 0,
});

let db: NonNullable<typeof mongoose.connection.db>;

beforeAll(async () => {
	db = mongoose.connection.db!;
	await applyValidator(db, collectionName, progressesSchema);
});

describe("progresses collection validator", () => {
	it("rejects a raw insert with a negative positionSeconds (code 121)", async () => {
		const negativePosition = { ...validProgress(), positionSeconds: -1 };
		await expect(
			db.collection(collectionName).insertOne(negativePosition),
		).rejects.toMatchObject({ code: 121 });
	});

	it("accepts a valid raw insert without timestamps or completedAt", async () => {
		await expect(
			db.collection(collectionName).insertOne(validProgress()),
		).resolves.toBeDefined();
	});

	it("accepts a null completedAt (written on an incomplete upsert)", async () => {
		const withNullCompletedAt = { ...validProgress(), completedAt: null };
		await expect(
			db.collection(collectionName).insertOne(withNullCompletedAt),
		).resolves.toBeDefined();
	});
});

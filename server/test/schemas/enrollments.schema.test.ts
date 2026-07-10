//* test/schemas/enrollments.schema.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import mongoose, { Types } from "mongoose";

import Enrollment from "../../src/models/enrollment.model";
import { createEnrollment } from "../../src/services/enrollment.service";
import enrollmentsSchema from "../../src/schemas/enrollments.schema";
import { applyValidator } from "./applyValidator";

const collectionName = Enrollment.collection.collectionName;

const validEnrollment = () => ({
	_id: new Types.ObjectId(),
	userId: new Types.ObjectId(),
	courseId: new Types.ObjectId(),
	createdAt: new Date(),
	__v: 0,
});

let db: NonNullable<typeof mongoose.connection.db>;

beforeAll(async () => {
	db = mongoose.connection.db!;
	await applyValidator(db, collectionName, enrollmentsSchema);
});

describe("enrollments collection validator", () => {
	it("rejects a raw insert with a string userId (wrong bsonType, code 121)", async () => {
		const badUserId = { ...validEnrollment(), userId: "not-an-objectid" };
		await expect(
			db.collection(collectionName).insertOne(badUserId),
		).rejects.toMatchObject({ code: 121 });
	});

	it("accepts a valid raw insert", async () => {
		await expect(
			db.collection(collectionName).insertOne(validEnrollment()),
		).resolves.toBeDefined();
	});

	// Faithfulness: the real upsert write path (setDefaultsOnInsert) must pass.
	it("accepts a real enrollment created through the service upsert", async () => {
		await expect(
			createEnrollment({
				userId: new Types.ObjectId().toString(),
				courseId: new Types.ObjectId().toString(),
			}),
		).resolves.toBeTruthy();
	});
});

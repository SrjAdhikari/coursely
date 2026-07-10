//* test/schemas/lessons.schema.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import mongoose, { Types } from "mongoose";

import Lesson from "../../src/models/lesson.model";
import lessonsSchema from "../../src/schemas/lessons.schema";
import { applyValidator } from "./applyValidator";

const collectionName = Lesson.collection.collectionName;

const validLesson = () => ({
	_id: new Types.ObjectId(),
	sectionId: new Types.ObjectId(),
	courseId: new Types.ObjectId(),
	title: "Welcome",
	order: 0,
	isPreview: false,
	duration: 0,
	__v: 0,
});

let db: NonNullable<typeof mongoose.connection.db>;

beforeAll(async () => {
	db = mongoose.connection.db!;
	await applyValidator(db, collectionName, lessonsSchema);
});

describe("lessons collection validator", () => {
	it("rejects a raw insert with a string order (wrong bsonType, code 121)", async () => {
		const badOrder = { ...validLesson(), order: "1" };
		await expect(
			db.collection(collectionName).insertOne(badOrder),
		).rejects.toMatchObject({ code: 121 });
	});

	it("accepts a valid raw insert", async () => {
		await expect(
			db.collection(collectionName).insertOne(validLesson()),
		).resolves.toBeDefined();
	});
});

//* test/schemas/courses.schema.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import mongoose, { Types } from "mongoose";

import Course from "../../src/models/course.model";
import coursesSchema from "../../src/schemas/courses.schema";
import { applyValidator } from "./applyValidator";

const collectionName = Course.collection.collectionName;

const validCourse = () => ({
	_id: new Types.ObjectId(),
	title: "React Basics",
	slug: "react-basics",
	description: "Learn React",
	instructorName: "Asha Rai",
	thumbnailUrl: "https://example.com/thumb.jpg",
	price: 49900,
	currency: "INR",
	isPublished: false,
	learningOutcomes: ["Build apps"],
	createdAt: new Date(),
	updatedAt: new Date(),
	__v: 0,
});

let db: NonNullable<typeof mongoose.connection.db>;

beforeAll(async () => {
	db = mongoose.connection.db!;
	await applyValidator(db, collectionName, coursesSchema);
});

describe("courses collection validator", () => {
	it("rejects a raw insert carrying an unknown field (code 121)", async () => {
		const withExtra = { ...validCourse(), promoted: true };
		await expect(
			db.collection(collectionName).insertOne(withExtra),
		).rejects.toMatchObject({ code: 121 });
	});

	it("accepts a valid raw insert", async () => {
		await expect(
			db.collection(collectionName).insertOne(validCourse()),
		).resolves.toBeDefined();
	});

	it("accepts a course document missing learningOutcomes (legacy doc)", async () => {
		const legacy: Record<string, unknown> = validCourse();
		delete legacy.learningOutcomes;
		await expect(
			db.collection(collectionName).insertOne(legacy),
		).resolves.toBeDefined();
	});
});

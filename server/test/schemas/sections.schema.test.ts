//* test/schemas/sections.schema.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import mongoose, { Types } from "mongoose";

import Section from "../../src/models/section.model";
import sectionsSchema from "../../src/schemas/sections.schema";
import { applyValidator } from "./applyValidator";

const collectionName = Section.collection.collectionName;

const validSection = () => ({
	_id: new Types.ObjectId(),
	courseId: new Types.ObjectId(),
	title: "Introduction",
	order: 0,
	__v: 0,
});

let db: NonNullable<typeof mongoose.connection.db>;

beforeAll(async () => {
	db = mongoose.connection.db!;
	await applyValidator(db, collectionName, sectionsSchema);
});

describe("sections collection validator", () => {
	it("rejects a raw insert missing the required courseId (code 121)", async () => {
		const { courseId: _omitted, ...withoutCourseId } = validSection();
		await expect(
			db.collection(collectionName).insertOne(withoutCourseId),
		).rejects.toMatchObject({ code: 121 });
	});

	it("accepts a valid raw insert", async () => {
		await expect(
			db.collection(collectionName).insertOne(validSection()),
		).resolves.toBeDefined();
	});
});

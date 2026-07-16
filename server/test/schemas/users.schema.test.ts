//* test/schemas/users.schema.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import mongoose, { Types } from "mongoose";

import User from "../../src/models/user.model";
import usersSchema from "../../src/schemas/users.schema";
import { applyValidator } from "./applyValidator";

const collectionName = User.collection.collectionName;

// A document that mirrors exactly what Mongoose writes for a saved user.
const validUser = () => ({
	_id: new Types.ObjectId(),
	name: "Asha Rai",
	email: "asha@example.com",
	password: "hashed_pw_1234",
	role: "student",
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	__v: 0,
});

let db: NonNullable<typeof mongoose.connection.db>;

beforeAll(async () => {
	db = mongoose.connection.db!;
	await applyValidator(db, collectionName, usersSchema);
});

describe("users collection validator", () => {
	it("rejects a raw insert with an out-of-enum role (code 121)", async () => {
		const badRole = { ...validUser(), role: "superuser" };
		await expect(
			db.collection(collectionName).insertOne(badRole),
		).rejects.toMatchObject({ code: 121 });
	});

	it("accepts a valid raw insert", async () => {
		await expect(
			db.collection(collectionName).insertOne(validUser()),
		).resolves.toBeDefined();
	});

	it("accepts a plus-tagged email (aligned with the model + z.email)", async () => {
		await expect(
			db
				.collection(collectionName)
				.insertOne({ ...validUser(), email: "user+tag@example.com" }),
		).resolves.toBeDefined();
	});

	it("rejects a raw insert with a malformed email (code 121)", async () => {
		await expect(
			db
				.collection(collectionName)
				.insertOne({ ...validUser(), email: "not-an-email" }),
		).rejects.toMatchObject({ code: 121 });
	});

	it.each([
		["all digits", "12313213"],
		["an email address", "peyij91811@duvips.com"],
		["a period", "John A. Smith"],
		["a double space", "Mary  Jane"],
		["a leading special character", "'tHooft"],
	])("rejects a raw insert whose name has %s (code 121)", async (_label, name) => {
		await expect(
			db.collection(collectionName).insertOne({ ...validUser(), name }),
		).rejects.toMatchObject({ code: 121 });
	});

	it.each([
		["accented / non-ASCII letters", "José Müller", "jose@example.com"],
		["an apostrophe", "O'Brien", "obrien@example.com"],
		["a hyphenated compound name", "Jean-Luc Picard", "jeanluc@example.com"],
	])("accepts a raw insert with %s", async (_label, name, email) => {
		await expect(
			db.collection(collectionName).insertOne({ ...validUser(), name, email }),
		).resolves.toBeDefined();
	});
});

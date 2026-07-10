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
});

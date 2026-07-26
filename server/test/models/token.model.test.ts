//* test/models/token.model.test.ts

import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import Token, { type TokenType } from "../../src/models/token.model";

const oneHourOut = () => new Date(Date.now() + 60 * 60 * 1000);

describe("Token model", () => {
	it("persists a token with its userId, hash, type, and expiry", async () => {
		const userId = new Types.ObjectId();
		const token = await Token.create({
			userId,
			tokenHash: "hash-a",
			type: "email_verification",
			expiresAt: oneHourOut(),
		});

		expect(token._id).toBeInstanceOf(Types.ObjectId);
		expect(token.type).toBe("email_verification");
		expect(token.tokenHash).toBe("hash-a");
	});

	it("requires a type", async () => {
		const userId = new Types.ObjectId();
		await expect(
			Token.create({ userId, tokenHash: "hash-b", expiresAt: oneHourOut() }),
		).rejects.toThrow(/type/i);
	});

	it("rejects an out-of-enum type", async () => {
		const userId = new Types.ObjectId();
		await expect(
			Token.create({
				userId,
				tokenHash: "hash-c",
				// Cast past the compile-time union to assert the runtime enum guard.
				type: "magic_link" as TokenType,
				expiresAt: oneHourOut(),
			}),
		).rejects.toThrow();
	});

	it("rejects unknown fields (strict: throw)", async () => {
		const userId = new Types.ObjectId();
		await expect(
			Token.create({
				userId,
				tokenHash: "hash-d",
				type: "password_reset",
				expiresAt: oneHourOut(),
				foo: "bar",
			} as never),
		).rejects.toThrow();
	});

	it("declares a TTL index on expiresAt (expireAfterSeconds: 0)", async () => {
		await Token.init(); // ensure indexes are built before inspecting them
		const indexes = await Token.collection.indexes();
		const ttl = indexes.find((index) => index.key?.expiresAt === 1);
		expect(ttl).toBeDefined();
		expect(ttl?.expireAfterSeconds).toBe(0);
	});
});

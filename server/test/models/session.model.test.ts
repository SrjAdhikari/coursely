//* test/models/session.model.test.ts

import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import Session from "../../src/models/session.model";

// Pinned locally (not imported) so the test independently asserts the 7-day contract.
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

describe("Session model", () => {
	it("assigns an ObjectId _id and defaults expiresAt to ~7 days out", async () => {
		const userId = new Types.ObjectId();
		const before = Date.now();
		const session = await Session.create({ userId, tokenHash: "hash-a" });
		const after = Date.now();

		expect(session._id).toBeInstanceOf(Types.ObjectId);
		// Default expiry is now + 7 days; bound both sides to catch a wrong default.
		expect(session.expiresAt.getTime()).toBeGreaterThanOrEqual(
			before + SEVEN_DAYS_MS,
		);
		expect(session.expiresAt.getTime()).toBeLessThanOrEqual(
			after + SEVEN_DAYS_MS,
		);
	});

	it("requires userId", async () => {
		await expect(Session.create({ tokenHash: "hash-b" })).rejects.toThrow(
			/userId/i,
		);
	});

	it("requires tokenHash", async () => {
		const userId = new Types.ObjectId();
		await expect(Session.create({ userId })).rejects.toThrow(/tokenHash/i);
	});

	it("rejects a duplicate tokenHash (unique index)", async () => {
		await Session.init(); // ensure the unique index is built before inserting
		const userId = new Types.ObjectId();
		await Session.create({ userId, tokenHash: "dupe-hash" });
		await expect(
			Session.create({ userId, tokenHash: "dupe-hash" }),
		).rejects.toThrow();
	});

	it("declares a TTL index on expiresAt (expireAfterSeconds: 0)", async () => {
		await Session.init(); // ensure indexes are built before inspecting them
		const indexes = await Session.collection.indexes();
		const ttl = indexes.find((index) => index.key?.expiresAt === 1);
		expect(ttl).toBeDefined();
		expect(ttl?.expireAfterSeconds).toBe(0);
	});
});

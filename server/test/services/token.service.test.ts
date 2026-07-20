//* test/services/token.service.test.ts

import { describe, it, expect } from "vitest";
import { Types } from "mongoose";

import { issueToken, consumeToken } from "../../src/services/token.service";
import Token from "../../src/models/token.model";
import { hashToken } from "../../src/utils/token";

describe("token.service", () => {
	describe("issueToken", () => {
		it("stores only the hash of the returned raw token with a future expiry", async () => {
			const userId = new Types.ObjectId();
			const rawToken = await issueToken(userId, "email_verification");

			const stored = await Token.findOne({ userId, type: "email_verification" });
			expect(stored).not.toBeNull();
			expect(stored?.tokenHash).toBe(hashToken(rawToken));
			expect(stored?.tokenHash).not.toBe(rawToken);
			expect(stored?.expiresAt.getTime()).toBeGreaterThan(Date.now());
		});

		it("revokes any existing token of the same type for that user", async () => {
			const userId = new Types.ObjectId();
			await issueToken(userId, "email_verification");
			await issueToken(userId, "email_verification");

			expect(
				await Token.countDocuments({ userId, type: "email_verification" }),
			).toBe(1);
		});

		it("uses a ~24h expiry for verification and ~1h for reset", async () => {
			const userId = new Types.ObjectId();
			await issueToken(userId, "email_verification");
			await issueToken(userId, "password_reset");

			const verification = await Token.findOne({
				userId,
				type: "email_verification",
			});
			const reset = await Token.findOne({ userId, type: "password_reset" });

			const verificationLifetimeMs =
				verification!.expiresAt.getTime() - Date.now();
			const resetLifetimeMs = reset!.expiresAt.getTime() - Date.now();
			expect(verificationLifetimeMs).toBeGreaterThan(23 * 60 * 60 * 1000);
			expect(resetLifetimeMs).toBeLessThan(2 * 60 * 60 * 1000);
		});
	});

	describe("consumeToken", () => {
		it("returns the userId and deletes the token (single-use)", async () => {
			const userId = new Types.ObjectId();
			const rawToken = await issueToken(userId, "password_reset");

			const resolvedUserId = await consumeToken(rawToken, "password_reset");
			expect(resolvedUserId.toString()).toBe(userId.toString());
			expect(await Token.countDocuments({ userId })).toBe(0);
		});

		it("throws 400 INVALID_OR_EXPIRED_TOKEN for an unknown token", async () => {
			await expect(
				consumeToken("nope", "email_verification"),
			).rejects.toMatchObject({
				statusCode: 400,
				errorCode: "INVALID_OR_EXPIRED_TOKEN",
			});
		});

		it("throws for a token consumed with the wrong type and leaves it intact", async () => {
			const userId = new Types.ObjectId();
			const rawToken = await issueToken(userId, "email_verification");

			await expect(
				consumeToken(rawToken, "password_reset"),
			).rejects.toMatchObject({ errorCode: "INVALID_OR_EXPIRED_TOKEN" });

			// A wrong-type attempt must not destroy the still-valid token.
			expect(
				await Token.countDocuments({ userId, type: "email_verification" }),
			).toBe(1);
			await expect(
				consumeToken(rawToken, "email_verification"),
			).resolves.toMatchObject({});
		});

		it("throws for an expired token", async () => {
			const userId = new Types.ObjectId();
			const rawToken = await issueToken(userId, "email_verification");
			await Token.updateOne(
				{ userId, type: "email_verification" },
				{ $set: { expiresAt: new Date(Date.now() - 1000) } },
			);
			await expect(
				consumeToken(rawToken, "email_verification"),
			).rejects.toMatchObject({ errorCode: "INVALID_OR_EXPIRED_TOKEN" });
		});
	});
});

//* test/services/auth.service.test.ts

import { describe, it, expect } from "vitest";

import {
	registerUser,
	loginUser,
	logoutUser,
} from "../../src/services/auth.service";
import User from "../../src/models/user.model";
import Session from "../../src/models/session.model";
import { hashSessionToken } from "../../src/utils/sessionToken";
import { createTestUser, createTestSession } from "../helpers/factories";

describe("auth.service", () => {
	describe("registerUser", () => {
		it("creates a student with a hashed password and issues no session (login mints the session)", async () => {
			const result = await registerUser(
				"Asha",
				"asha@example.com",
				"Password123",
			);
			expect(result).toBeUndefined();

			const stored = await User.findOne({ email: "asha@example.com" }).select(
				"+password",
			);
			expect(stored?.name).toBe("Asha");
			expect(stored?.role).toBe("student");
			expect(stored?.password).not.toBe("Password123");
			expect(await Session.countDocuments({ userId: stored?._id })).toBe(0);
		});

		it("does not throw or create a duplicate for a taken email (no enumeration)", async () => {
			await createTestUser({ email: "dupe@example.com" });

			await expect(
				registerUser("Dupe User", "dupe@example.com", "Password123"),
			).resolves.toBeUndefined();

			expect(await User.countDocuments({ email: "dupe@example.com" })).toBe(1);
		});
	});

	describe("loginUser", () => {
		it("returns a random session token backed by a hash-only session", async () => {
			await createTestUser({ email: "ok@example.com", password: "Password123" });
			const token = await loginUser("ok@example.com", "Password123");

			// A high-entropy token, NOT a Mongo ObjectId.
			expect(token).not.toMatch(/^[a-f0-9]{24}$/);

			// Only the hash is persisted; the raw token is never stored.
			const stored = await Session.findOne({
				tokenHash: hashSessionToken(token),
			});
			expect(stored).not.toBeNull();
			expect(stored?.tokenHash).not.toBe(token);
		});

		it("rejects a wrong password with a generic 401 INVALID_CREDENTIALS", async () => {
			await createTestUser({ email: "ok2@example.com", password: "Password123" });
			await expect(
				loginUser("ok2@example.com", "WrongPass1"),
			).rejects.toMatchObject({
				statusCode: 401,
				errorCode: "INVALID_CREDENTIALS",
			});
		});

		it("rejects an unknown email with the SAME generic 401 (no enumeration)", async () => {
			await expect(
				loginUser("ghost@example.com", "Password123"),
			).rejects.toMatchObject({
				statusCode: 401,
				errorCode: "INVALID_CREDENTIALS",
			});
		});

		it("blocks a deactivated account with 403 ACCOUNT_DEACTIVATED", async () => {
			await createTestUser({
				email: "off@example.com",
				password: "Password123",
				isActive: false,
			});
			await expect(
				loginUser("off@example.com", "Password123"),
			).rejects.toMatchObject({
				statusCode: 403,
				errorCode: "ACCOUNT_DEACTIVATED",
			});
		});

		it("mints a distinct token on every login (fixation defense, R2.1)", async () => {
			await createTestUser({ email: "re@example.com", password: "Password123" });
			const first = await loginUser("re@example.com", "Password123");
			const second = await loginUser("re@example.com", "Password123");
			expect(first).not.toBe(second);
		});
	});

	describe("logoutUser", () => {
		it("deletes the session document server-side", async () => {
			const user = await createTestUser({ email: "bye@example.com" });
			const { session } = await createTestSession(user._id);
			await logoutUser(session._id.toString());
			expect(await Session.findById(session._id)).toBeNull();
		});
	});
});

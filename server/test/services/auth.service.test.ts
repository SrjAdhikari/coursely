//* test/services/auth.service.test.ts

import { describe, it, expect } from "vitest";
import {
	registerUser,
	loginUser,
	logoutUser,
} from "../../src/services/auth.service";
import User from "../../src/models/user.model";
import Session from "../../src/models/session.model";
import { createTestUser } from "../helpers/factories";

describe("auth.service", () => {
	describe("registerUser", () => {
		it("creates a student with a hashed password and a session", async () => {
			const { user, sessionId } = await registerUser({
				name: "Asha",
				email: "asha@example.com",
				password: "Password123",
			});

			expect(user).toEqual({
				id: expect.any(String),
				name: "Asha",
				email: "asha@example.com",
				role: "student",
			});
			const stored = await User.findOne({ email: "asha@example.com" }).select(
				"+password",
			);
			expect(stored?.password).not.toBe("Password123");
			expect(await Session.findById(sessionId)).not.toBeNull();
		});

		it("rejects a duplicate email with 409 USER_ALREADY_EXISTS", async () => {
			await createTestUser({ email: "dupe@example.com" });
			await expect(
				registerUser({
					name: "X",
					email: "dupe@example.com",
					password: "Password123",
				}),
			).rejects.toMatchObject({
				statusCode: 409,
				errorCode: "USER_ALREADY_EXISTS",
			});
		});
	});

	describe("loginUser", () => {
		it("returns the public user + a session on correct credentials", async () => {
			await createTestUser({ email: "ok@example.com", password: "Password123" });
			const { user, sessionId } = await loginUser({
				email: "ok@example.com",
				password: "Password123",
			});
			expect(user.email).toBe("ok@example.com");
			expect(await Session.findById(sessionId)).not.toBeNull();
		});

		it("rejects a wrong password with a generic 401 INVALID_CREDENTIALS", async () => {
			await createTestUser({ email: "ok2@example.com", password: "Password123" });
			await expect(
				loginUser({ email: "ok2@example.com", password: "WrongPass1" }),
			).rejects.toMatchObject({
				statusCode: 401,
				errorCode: "INVALID_CREDENTIALS",
			});
		});

		it("rejects an unknown email with the SAME generic 401 (no enumeration)", async () => {
			await expect(
				loginUser({ email: "ghost@example.com", password: "Password123" }),
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
				loginUser({ email: "off@example.com", password: "Password123" }),
			).rejects.toMatchObject({
				statusCode: 403,
				errorCode: "ACCOUNT_DEACTIVATED",
			});
		});

		it("regenerates the session id on every login (fixation defense, R2.1)", async () => {
			await createTestUser({ email: "re@example.com", password: "Password123" });
			const first = await loginUser({
				email: "re@example.com",
				password: "Password123",
			});
			const second = await loginUser({
				email: "re@example.com",
				password: "Password123",
			});
			expect(first.sessionId).not.toBe(second.sessionId);
		});
	});

	describe("logoutUser", () => {
		it("deletes the session document server-side", async () => {
			const { sessionId } = await registerUser({
				name: "Bye",
				email: "bye@example.com",
				password: "Password123",
			});
			await logoutUser(sessionId);
			expect(await Session.findById(sessionId)).toBeNull();
		});
	});
});

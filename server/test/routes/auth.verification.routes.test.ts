//* test/routes/auth.verification.routes.test.ts

import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../../src/app";
import envConfig from "../../src/constants/env";
import User from "../../src/models/user.model";
import { issueToken } from "../../src/services/token.service";
import { createTestUser } from "../helpers/factories";

const { APP_ORIGIN } = envConfig;

// Every request gets its own client IP so the shared per-IP auth limiter
// (10 requests / 15 min) can't make a later test in this file flake with a 429.
let clientIpCounter = 0;
const nextClientIp = (): string => {
	clientIpCounter += 1;
	return `203.0.113.${clientIpCounter}`;
};

const post = (path: string, body: Record<string, unknown>) =>
	request(app)
		.post(path)
		.set("Origin", APP_ORIGIN)
		.set("X-Forwarded-For", nextClientIp())
		.send(body);

describe("POST /api/auth/verify-email", () => {
	it("verifies the account for a valid token (200)", async () => {
		const user = await createTestUser({ isVerified: false });
		const rawToken = await issueToken(user._id, "email_verification");

		const res = await post("/api/auth/verify-email", { token: rawToken });
		expect(res.status).toBe(200);
		expect(res.body.message).toBe("Email verified. You can now log in.");

		const updated = await User.findById(user._id);
		expect(updated?.isVerified).toBe(true);
	});

	it("returns 400 INVALID_OR_EXPIRED_TOKEN for a bad token", async () => {
		const res = await post("/api/auth/verify-email", { token: "nope" });
		expect(res.status).toBe(400);
		expect(res.body.error.code).toBe("INVALID_OR_EXPIRED_TOKEN");
	});

	it("returns 400 VALIDATION_ERROR for a missing token", async () => {
		const res = await post("/api/auth/verify-email", {});
		expect(res.status).toBe(400);
		expect(res.body.error.code).toBe("VALIDATION_ERROR");
	});
});

describe("POST /api/auth/resend-verification", () => {
	it("returns an identical generic 200 for an unverified account and an unknown email (no enumeration)", async () => {
		await createTestUser({ email: "pending@example.com", isVerified: false });

		const realAccount = await post("/api/auth/resend-verification", {
			email: "pending@example.com",
		});
		const unknownEmail = await post("/api/auth/resend-verification", {
			email: "ghost@example.com",
		});

		expect(realAccount.status).toBe(200);
		expect(realAccount.body.message).toBe(
			"If your account needs verifying, check your inbox for a new link.",
		);
		expect(unknownEmail.status).toBe(realAccount.status);
		expect(unknownEmail.body).toEqual(realAccount.body);
	});
});

describe("POST /api/auth/forgot-password", () => {
	it("returns an identical generic 200 for a real account and an unknown email (no enumeration)", async () => {
		await createTestUser({ email: "member@example.com" });

		const realAccount = await post("/api/auth/forgot-password", {
			email: "member@example.com",
		});
		const unknownEmail = await post("/api/auth/forgot-password", {
			email: "ghost@example.com",
		});

		expect(realAccount.status).toBe(200);
		expect(realAccount.body.message).toBe(
			"If an account exists for that email, check your inbox for a reset link.",
		);
		expect(unknownEmail.status).toBe(realAccount.status);
		expect(unknownEmail.body).toEqual(realAccount.body);
	});
});

describe("POST /api/auth/reset-password", () => {
	it("resets the password for a valid token (200) and lets the user log in", async () => {
		const user = await createTestUser({
			email: "reset@example.com",
			password: "OldPass123!",
			isVerified: false,
		});
		const rawToken = await issueToken(user._id, "password_reset");

		const res = await post("/api/auth/reset-password", {
			token: rawToken,
			newPassword: "NewPass456!",
		});
		expect(res.status).toBe(200);
		expect(res.body.message).toBe("Password reset. Please log in.");

		// Reset also verifies the account, so the login gate now passes.
		const login = await post("/api/auth/login", {
			email: "reset@example.com",
			password: "NewPass456!",
		});
		expect(login.status).toBe(200);
	});

	it("returns 400 INVALID_OR_EXPIRED_TOKEN for a bad token", async () => {
		const res = await post("/api/auth/reset-password", {
			token: "nope",
			newPassword: "NewPass456!",
		});
		expect(res.status).toBe(400);
		expect(res.body.error.code).toBe("INVALID_OR_EXPIRED_TOKEN");
	});
});

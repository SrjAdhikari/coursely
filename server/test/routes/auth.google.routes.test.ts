//* test/routes/auth.google.routes.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";

const { verifyGoogleIdTokenMock } = vi.hoisted(() => ({
	verifyGoogleIdTokenMock: vi.fn(),
}));
vi.mock("../../src/lib/googleAuth", () => ({ default: verifyGoogleIdTokenMock }));

import app from "../../src/app";
import envConfig from "../../src/constants/env";
import User from "../../src/models/user.model";
import { createTestUser } from "../helpers/factories";

const { APP_ORIGIN } = envConfig;

describe("POST /api/auth/google", () => {
	beforeEach(() => vi.clearAllMocks());

	const identity = (over = {}) => ({
		email: "asha@example.com",
		name: "Asha Rai",
		emailVerified: true,
		avatarUrl: "https://lh3.googleusercontent.com/a/pic",
		...over,
	});

	it("creates a new account, sets the sid cookie, returns 201, and /me carries the avatar", async () => {
		verifyGoogleIdTokenMock.mockResolvedValue(identity());
		const agent = request.agent(app).set("Origin", APP_ORIGIN);

		const res = await agent.post("/api/auth/google").send({ idToken: "tok" });
		expect(res.status).toBe(201);
		expect(res.headers["set-cookie"]?.[0]).toMatch(/sid=/);

		const me = await agent.get("/api/auth/me");
		expect(me.body.data.avatarUrl).toBe(
			"https://lh3.googleusercontent.com/a/pic",
		);
	});

	it("logs in a returning Google account with 200", async () => {
		await User.create({
			name: "Asha Rai",
			email: "asha@example.com",
			provider: "google",
		});
		verifyGoogleIdTokenMock.mockResolvedValue(identity());

		const res = await request(app)
			.post("/api/auth/google")
			.set("Origin", APP_ORIGIN)
			.send({ idToken: "tok" });

		expect(res.status).toBe(200);
		expect(res.headers["set-cookie"]?.[0]).toMatch(/sid=/);
	});

	it("rejects a Google sign-in on a password account with 409", async () => {
		await createTestUser({ email: "asha@example.com", password: "Password@123" });
		verifyGoogleIdTokenMock.mockResolvedValue(identity());
		const res = await request(app)
			.post("/api/auth/google")
			.set("Origin", APP_ORIGIN)
			.send({ idToken: "tok" });

		expect(res.status).toBe(409);
		expect(res.body.error.code).toBe("PROVIDER_MISMATCH");
	});

	it("rejects an unverified Google email with 403", async () => {
		verifyGoogleIdTokenMock.mockResolvedValue(identity({ emailVerified: false }));
		const res = await request(app)
			.post("/api/auth/google")
			.set("Origin", APP_ORIGIN)
			.send({ idToken: "tok" });

		expect(res.status).toBe(403);
		expect(res.body.error.code).toBe("GOOGLE_EMAIL_NOT_VERIFIED");
	});

	it("returns 400 VALIDATION_ERROR for an empty idToken", async () => {
		const res = await request(app)
			.post("/api/auth/google")
			.set("Origin", APP_ORIGIN)
			.send({ idToken: "" });

		expect(res.status).toBe(400);
		expect(res.body.error.code).toBe("VALIDATION_ERROR");
	});
});

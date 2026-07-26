//* test/routes/auth.routes.test.ts

import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../../src/app";
import envConfig from "../../src/constants/env";
import User from "../../src/models/user.model";
import { createTestUser } from "../helpers/factories";

const { APP_ORIGIN } = envConfig;

const VALID = {
	name: "Asha Rai",
	email: "asha@example.com",
	password: "Password@123",
};

describe("auth routes", () => {
	it("register creates the account without a cookie; a follow-up login logs in and GET /me returns the user", async () => {
		const agent = request.agent(app).set("Origin", APP_ORIGIN);

		const register = await agent.post("/api/auth/register").send(VALID);
		expect(register.status).toBe(201);
		expect(register.headers["set-cookie"]).toBeUndefined();

		// Simulate the user clicking the verification link before logging in.
		await User.updateOne(
			{ email: VALID.email },
			{ $set: { isVerified: true } },
		);

		const login = await agent
			.post("/api/auth/login")
			.send({ email: VALID.email, password: VALID.password });
		expect(login.status).toBe(200);
		expect(login.headers["set-cookie"]?.[0]).toMatch(/sid=/);

		const me = await agent.get("/api/auth/me");
		expect(me.status).toBe(200);
		expect(me.body.data).toMatchObject({
			name: "Asha Rai",
			email: "asha@example.com",
			role: "student",
		});
	});

	it("returns an identical generic response for a new and an already-registered email (no enumeration)", async () => {
		await createTestUser({ email: "taken@example.com" });

		const freshEmail = await request(app)
			.post("/api/auth/register")
			.set("Origin", APP_ORIGIN)
			.send({ ...VALID, email: "fresh@example.com" });

		const takenEmail = await request(app)
			.post("/api/auth/register")
			.set("Origin", APP_ORIGIN)
			.send({ ...VALID, email: "taken@example.com" });

		expect(takenEmail.status).toBe(freshEmail.status);
		expect(takenEmail.body).toEqual(freshEmail.body);
		expect(freshEmail.headers["set-cookie"]).toBeUndefined();
		expect(takenEmail.headers["set-cookie"]).toBeUndefined();
	});

	it("rejects a wrong password with a generic 401 (no enumeration)", async () => {
		await createTestUser({ email: "ok@example.com", password: "Password@123" });
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: "ok@example.com", password: "WrongPass1" });
		expect(res.status).toBe(401);
		expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
		expect(res.body.error.message).toBe("Invalid email or password");
	});

	it("returns 400 VALIDATION_ERROR for a malformed register body", async () => {
		const res = await request(app)
			.post("/api/auth/register")
			.send({ name: "A", email: "nope", password: "short" });
		expect(res.status).toBe(400);
		expect(res.body.error.code).toBe("VALIDATION_ERROR");
	});

	it("logout deletes the session server-side (subsequent /me → 401)", async () => {
		const agent = request.agent(app).set("Origin", APP_ORIGIN);
		await agent
			.post("/api/auth/register")
			.send({ ...VALID, email: "bye@example.com" });
		await User.updateOne(
			{ email: "bye@example.com" },
			{ $set: { isVerified: true } },
		);
		await agent
			.post("/api/auth/login")
			.send({ email: "bye@example.com", password: VALID.password });

		const logout = await agent.post("/api/auth/logout");
		expect(logout.status).toBe(200);

		const me = await agent.get("/api/auth/me");
		expect(me.status).toBe(401);
		expect(me.body.error.code).toBe("UNAUTHORIZED_ACCESS");
	});

	it("GET /me without a cookie returns 401", async () => {
		const res = await request(app).get("/api/auth/me");
		expect(res.status).toBe(401);
		expect(res.body.error.code).toBe("UNAUTHORIZED_ACCESS");
	});
});

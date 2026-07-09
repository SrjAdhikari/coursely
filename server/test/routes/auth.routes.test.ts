//* test/routes/auth.routes.test.ts

import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../../src/app";
import envConfig from "../../src/constants/env";
import { createTestUser } from "../helpers/factories";

const { APP_ORIGIN } = envConfig;

const VALID = {
	name: "Asha Rai",
	email: "asha@example.com",
	password: "Password@123",
};

describe("auth routes", () => {
	it("register sets a session cookie and GET /me returns the user", async () => {
		const agent = request.agent(app).set("Origin", APP_ORIGIN);

		const register = await agent.post("/api/auth/register").send(VALID);
		expect(register.status).toBe(201);
		expect(register.headers["set-cookie"]?.[0]).toMatch(/sid=/);

		const me = await agent.get("/api/auth/me");
		expect(me.status).toBe(200);
		expect(me.body.data).toMatchObject({
			name: "Asha Rai",
			email: "asha@example.com",
			role: "student",
		});
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

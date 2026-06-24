import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("app foundation", () => {
	it("GET /health returns 200 with a success envelope", async () => {
		const res = await request(app).get("/health");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ success: true, message: expect.any(String) });
	});

	it("unknown route returns 404 with a ROUTE_NOT_FOUND error envelope", async () => {
		const res = await request(app).get("/api/nope");
		expect(res.status).toBe(404);
		expect(res.body.status).toBe("fail");
		expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
	});
});

//* test/middlewares/rateLimit.middleware.test.ts

import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

import {
	clientKey,
	rateLimitExceededHandler,
} from "../../src/middlewares/rateLimit.middleware";
import AppError from "../../src/errors/AppError";

describe("rate limiter", () => {
	it("keys authenticated requests by user id", () => {
		const req = {
			user: { id: "user-123" },
			headers: {},
			ip: "1.2.3.4",
		} as unknown as Request;
		expect(clientKey(req)).toBe("user-123");
	});

	it("keys anonymous requests by the Cloudflare client IP when present", () => {
		const req = {
			headers: { "cf-connecting-ip": "9.9.9.9" },
			ip: "1.2.3.4",
		} as unknown as Request;
		expect(clientKey(req)).toContain("9.9.9.9");
	});

	it("routes a limit breach through AppError(429, RATE_LIMITED)", () => {
		const next = vi.fn();
		rateLimitExceededHandler({} as Request, {} as Response, next);
		const err = next.mock.calls[0]![0] as AppError;
		expect(err).toBeInstanceOf(AppError);
		expect(err.statusCode).toBe(429);
		expect(err.errorCode).toBe("RATE_LIMITED");
	});
});

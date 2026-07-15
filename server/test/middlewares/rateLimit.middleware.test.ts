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

	it("keys anonymous requests by req.ip, not a spoofable cf-connecting-ip header", () => {
		const spoofed = {
			headers: { "cf-connecting-ip": "9.9.9.9" },
			ip: "1.2.3.4",
		} as unknown as Request;
		const clean = {
			headers: {},
			ip: "1.2.3.4",
		} as unknown as Request;

		// Same real client IP → same bucket, regardless of the client-settable header.
		expect(clientKey(spoofed)).toBe(clientKey(clean));
		expect(clientKey(spoofed)).toContain("1.2.3.4");
		expect(clientKey(spoofed)).not.toContain("9.9.9.9");
	});

	it("a rotating cf-connecting-ip header cannot create fresh rate-limit buckets", () => {
		const first = {
			headers: { "cf-connecting-ip": "10.0.0.1" },
			ip: "1.2.3.4",
		} as unknown as Request;
		const second = {
			headers: { "cf-connecting-ip": "10.0.0.2" },
			ip: "1.2.3.4",
		} as unknown as Request;

		// An attacker rotating the header must not escape their real-IP bucket.
		expect(clientKey(first)).toBe(clientKey(second));
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

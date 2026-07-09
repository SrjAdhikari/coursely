//* test/middlewares/csrf.middleware.test.ts

import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

import verifyRequestOrigin from "../../src/middlewares/csrf.middleware";
import AppError from "../../src/errors/AppError";
import envConfig from "../../src/constants/env";
import { SESSION_COOKIE_NAME } from "../../src/utils/cookies";

const { APP_ORIGIN } = envConfig; // http://localhost:5173 in the test env

// Minimal request stub with a case-insensitive header getter and optional
// signed session cookie (set `session: true` to simulate a logged-in caller).
const reqWith = (
	method: string,
	headers: { origin?: string; referer?: string } = {},
	options: { session?: boolean } = {},
) =>
	({
		method,
		get: (name: string) =>
			name.toLowerCase() === "origin"
				? headers.origin
				: name.toLowerCase() === "referer"
					? headers.referer
					: undefined,
		signedCookies: options.session
			? { [SESSION_COOKIE_NAME]: "a-session-id" }
			: {},
	}) as unknown as Request;

const expectForbidden = (call: () => void) => {
	try {
		call();
		throw new Error("should have thrown");
	} catch (err) {
		expect(err).toBeInstanceOf(AppError);
		expect((err as AppError).statusCode).toBe(403);
		expect((err as AppError).errorCode).toBe("CSRF_ORIGIN_MISMATCH");
	}
};

describe("verifyRequestOrigin (CSRF guard)", () => {
	it("skips safe methods (GET) regardless of Origin", () => {
		const next = vi.fn();
		verifyRequestOrigin(reqWith("GET"), {} as Response, next);
		expect(next).toHaveBeenCalledWith();
	});

	it("allows an unsafe method whose Origin matches APP_ORIGIN", () => {
		const next = vi.fn();
		verifyRequestOrigin(
			reqWith("POST", { origin: APP_ORIGIN }),
			{} as Response,
			next,
		);
		expect(next).toHaveBeenCalledWith();
	});

	it("rejects an unsafe method whose Origin does not match", () => {
		expectForbidden(() =>
			verifyRequestOrigin(
				reqWith("POST", { origin: "https://evil.example" }),
				{} as Response,
				vi.fn(),
			),
		);
	});

	it("falls back to the Referer origin when Origin is absent", () => {
		const next = vi.fn();
		verifyRequestOrigin(
			reqWith("PUT", { referer: `${APP_ORIGIN}/dashboard` }),
			{} as Response,
			next,
		);
		expect(next).toHaveBeenCalledWith();
	});

	it("rejects when the Referer origin does not match", () => {
		expectForbidden(() =>
			verifyRequestOrigin(
				reqWith("DELETE", { referer: "https://evil.example/x" }),
				{} as Response,
				vi.fn(),
			),
		);
	});

	it("allows neither Origin nor Referer when there is no session cookie (non-browser client)", () => {
		const next = vi.fn();
		verifyRequestOrigin(reqWith("POST"), {} as Response, next);
		expect(next).toHaveBeenCalledWith();
	});

	it("rejects an unsafe method with neither header when a session cookie is present (fail closed)", () => {
		expectForbidden(() =>
			verifyRequestOrigin(
				reqWith("POST", {}, { session: true }),
				{} as Response,
				vi.fn(),
			),
		);
	});
});

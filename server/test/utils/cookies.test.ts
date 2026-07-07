//* test/utils/cookies.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import type { Response } from "express";
import {
	SESSION_COOKIE_NAME,
	setSessionCookie,
	clearSessionCookie,
} from "../../src/utils/cookies";

const mockRes = () =>
	({ cookie: vi.fn(), clearCookie: vi.fn() }) as unknown as Response;

describe("cookie util", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it("sets a signed, httpOnly, Lax session cookie with a 7-day maxAge", () => {
		const res = mockRes();
		setSessionCookie(res, "session-id-123");

		expect(res.cookie).toHaveBeenCalledWith(
			SESSION_COOKIE_NAME,
			"session-id-123",
			expect.objectContaining({
				httpOnly: true,
				signed: true,
				sameSite: "lax",
				path: "/",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			}),
		);
		// host-only: no Domain attribute
		const opts = (res.cookie as ReturnType<typeof vi.fn>).mock.calls[0]![2];
		expect(opts.domain).toBeUndefined();
		// dev (NODE_ENV=test) omits Secure
		expect(opts.secure).toBe(false);
	});

	it("clears the cookie with matching attributes", () => {
		const res = mockRes();
		clearSessionCookie(res);
		expect(res.clearCookie).toHaveBeenCalledWith(
			SESSION_COOKIE_NAME,
			expect.objectContaining({
				httpOnly: true,
				signed: true,
				sameSite: "lax",
			}),
		);
	});

	// Cross-site prod hosts won't send a Lax cookie on XHR → require SameSite=None;
	// None mandates Secure. Module reads NODE_ENV at load, so re-import under prod.
	it("uses SameSite=None + Secure in production (cross-site hosts)", async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.resetModules();
		const { setSessionCookie: setProdSessionCookie } = await import(
			"../../src/utils/cookies"
		);

		const res = mockRes();
		setProdSessionCookie(res, "session-id-123");

		const opts = (res.cookie as ReturnType<typeof vi.fn>).mock.calls[0]![2];
		expect(opts.sameSite).toBe("none");
		expect(opts.secure).toBe(true);
	});
});

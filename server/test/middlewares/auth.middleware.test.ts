//* test/middlewares/auth.middleware.test.ts

import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

import { optionalAuth } from "../../src/middlewares/auth.middleware";
import Session from "../../src/models/session.model";
import { createTestUser, createTestSession } from "../helpers/factories";

const run = async (signedCookies: Record<string, string>) => {
	const req = { signedCookies } as unknown as Request;
	const next = vi.fn();
	await optionalAuth(req, {} as Response, next);
	return { req, next };
};

describe("optionalAuth", () => {
	it("attaches req.user for a valid session", async () => {
		const user = await createTestUser({ role: "student" });
		const { token } = await createTestSession(user._id);
		const { req, next } = await run({ sid: token });
		expect(req.user?.id).toBe(user._id.toString());
		expect(next).toHaveBeenCalledWith();
	});

	it("continues without a user when no cookie is present", async () => {
		const { req, next } = await run({});
		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledWith();
	});

	it("continues without a user for an unknown session token", async () => {
		const { req, next } = await run({ sid: "unknown-session-token" });
		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledWith();
	});

	it("does not attach a user for an inactive account", async () => {
		const user = await createTestUser({ isActive: false });
		const { token } = await createTestSession(user._id);
		const { req, next } = await run({ sid: token });
		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledWith();
	});

	it("does not attach a user for an expired session", async () => {
		const user = await createTestUser();
		const { token } = await createTestSession(user._id, {
			expiresAt: new Date(Date.now() - 1000),
		});
		const { req, next } = await run({ sid: token });
		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledWith();
	});

	it("continues anonymously when the session lookup rejects (store failure)", async () => {
		const spy = vi.spyOn(Session, "findOne").mockReturnValue({
			populate: () => ({ lean: () => Promise.reject(new Error("db down")) }),
		} as unknown as ReturnType<typeof Session.findOne>);

		const { req, next } = await run({ sid: "any-token" });

		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledWith();
		spy.mockRestore();
	});
});

//* test/middlewares/auth.middleware.test.ts

import { describe, it, expect, vi } from "vitest";
import mongoose from "mongoose";
import type { Request, Response } from "express";

import { optionalAuth } from "../../src/middlewares/auth.middleware";
import Session from "../../src/models/session.model";
import { createTestUser } from "../helpers/factories";

const run = async (signedCookies: Record<string, string>) => {
	const req = { signedCookies } as unknown as Request;
	const next = vi.fn();
	await optionalAuth(req, {} as Response, next);
	return { req, next };
};

describe("optionalAuth", () => {
	it("attaches req.user for a valid session", async () => {
		const user = await createTestUser({ role: "student" });
		const session = await Session.create({ userId: user._id });
		const { req, next } = await run({ sid: session._id.toString() });
		expect(req.user?.id).toBe(user._id.toString());
		expect(next).toHaveBeenCalledWith();
	});

	it("continues without a user when no cookie is present", async () => {
		const { req, next } = await run({});
		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledWith();
	});

	it("continues without a user for an unknown session id", async () => {
		const { req, next } = await run({
			sid: new mongoose.Types.ObjectId().toString(),
		});
		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledWith();
	});

	it("does not attach a user for an inactive account", async () => {
		const user = await createTestUser({ isActive: false });
		const session = await Session.create({ userId: user._id });
		const { req, next } = await run({ sid: session._id.toString() });
		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledWith();
	});

	it("does not attach a user for an expired session", async () => {
		const user = await createTestUser();
		const session = await Session.create({
			userId: user._id,
			expiresAt: new Date(Date.now() - 1000),
		});
		const { req, next } = await run({ sid: session._id.toString() });
		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledWith();
	});
});

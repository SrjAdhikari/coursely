//* test/middlewares/authorize.middleware.test.ts

import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

import {
	authorize,
	requireAdmin,
} from "../../src/middlewares/authorize.middleware";
import AppError from "../../src/errors/AppError";

const reqWith = (role?: "student" | "admin") =>
	({
		user: role ? { id: "1", name: "x", email: "x@y.z", role } : undefined,
	}) as Request;

describe("authorize", () => {
	it("calls next() when the user has an allowed role", () => {
		const next = vi.fn();
		requireAdmin(reqWith("admin"), {} as Response, next);
		expect(next).toHaveBeenCalledWith();
	});

	it("throws 403 INSUFFICIENT_ROLE for a student on an admin route", () => {
		try {
			requireAdmin(reqWith("student"), {} as Response, vi.fn());
			throw new Error("should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			expect((err as AppError).statusCode).toBe(403);
			expect((err as AppError).errorCode).toBe("INSUFFICIENT_ROLE");
		}
	});

	it("throws 401 UNAUTHORIZED_ACCESS when no user is attached", () => {
		try {
			authorize("student")(reqWith(undefined), {} as Response, vi.fn());
			throw new Error("should have thrown");
		} catch (err) {
			expect((err as AppError).statusCode).toBe(401);
			expect((err as AppError).errorCode).toBe("UNAUTHORIZED_ACCESS");
		}
	});
});

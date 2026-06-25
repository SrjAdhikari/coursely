//* test/middlewares/validate.middleware.test.ts

import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";
import validateBody from "../../src/middlewares/validate.middleware";
import { loginSchema } from "../../src/validators/auth.validator";
import AppError from "../../src/errors/AppError";

const run = (body: unknown) => {
	const req = { body } as Request;
	const next = vi.fn();
	validateBody(loginSchema)(req, {} as Response, next);
	return { req, next };
};

describe("validateBody", () => {
	it("calls next() and normalizes parsed data on valid input", () => {
		const { req, next } = run({ email: " Asha@Example.com ", password: "x" });
		expect(next).toHaveBeenCalledWith(); // no error arg
		expect(req.body.email).toBe("asha@example.com"); // trimmed + lowercased
	});

	it("throws a 400 VALIDATION_ERROR AppError on invalid input", () => {
		expect(() => run({ email: "not-an-email", password: "" })).toThrow(AppError);
		try {
			run({ email: "not-an-email", password: "" });
		} catch (err) {
			expect((err as AppError).statusCode).toBe(400);
			expect((err as AppError).errorCode).toBe("VALIDATION_ERROR");
		}
	});
});

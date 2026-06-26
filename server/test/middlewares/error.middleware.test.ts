//* test/middlewares/error.middleware.test.ts

import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";

import globalErrorHandler from "../../src/middlewares/error.middleware";
import AppError from "../../src/errors/AppError";
import httpStatus from "../../src/constants/httpStatus";
import appErrorCode from "../../src/constants/appErrorCode";

const { FORBIDDEN } = httpStatus;
const { INSUFFICIENT_ROLE } = appErrorCode;

// Build a one-route app whose handler throws the given error, wired to the
// global handler — lets us assert the rendered envelope per error shape.
const appThatThrows = (err: unknown) => {
	const app = express();
	app.get("/boom", () => {
		throw err;
	});
	app.use(globalErrorHandler);
	return app;
};

describe("global error handler", () => {
	it("renders an AppError with its own status, code and message", async () => {
		const res = await request(
			appThatThrows(new AppError("Nope", FORBIDDEN, INSUFFICIENT_ROLE)),
		).get("/boom");
		expect(res.status).toBe(403);
		expect(res.body).toMatchObject({
			status: "fail",
			error: { code: "INSUFFICIENT_ROLE", message: "Nope" },
		});
	});

	it("maps a Mongoose ValidationError to 400 VALIDATION_ERROR", async () => {
		const validationError = new mongoose.Error.ValidationError();
		validationError.addError(
			"title",
			new mongoose.Error.ValidatorError({
				message: "Title is required",
				path: "title",
			}),
		);
		const res = await request(appThatThrows(validationError)).get("/boom");
		expect(res.status).toBe(400);
		expect(res.body.error.code).toBe("VALIDATION_ERROR");
		expect(res.body.error.message).toContain("Title is required");
	});

	it("maps a Mongoose CastError to 404 RESOURCE_NOT_FOUND", async () => {
		const res = await request(
			appThatThrows(new mongoose.Error.CastError("ObjectId", "nope", "id")),
		).get("/boom");
		expect(res.status).toBe(404);
		expect(res.body.error.code).toBe("RESOURCE_NOT_FOUND");
	});

	it("maps a duplicate-key (11000) error to 409", async () => {
		const duplicate = new mongoose.mongo.MongoServerError({
			message: "E11000 duplicate key error",
		});
		duplicate.code = 11000;
		const res = await request(appThatThrows(duplicate)).get("/boom");
		expect(res.status).toBe(409);
		expect(res.body.error.code).toBe("USER_ALREADY_EXISTS");
	});

	it("falls back to 500 INTERNAL_ERROR for an unrecognized error", async () => {
		// The fallback path logs the unexpected error — silence it for clean output.
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const res = await request(appThatThrows(new Error("kaboom"))).get("/boom");
		expect(res.status).toBe(500);
		expect(res.body).toMatchObject({
			status: "error",
			error: { code: "INTERNAL_ERROR" },
		});
		errorSpy.mockRestore();
	});
});

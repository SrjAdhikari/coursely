//* src/middlewares/error.middleware.ts

import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";
import envConfig from "../constants/env";

const { NODE_ENV } = envConfig;
const { BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR } = httpStatus;
const { INTERNAL_ERROR, VALIDATION_ERROR, USER_ALREADY_EXISTS } = appErrorCode;

/**
 * Global error handling middleware for Express 5. MUST keep all four params so
 * Express recognizes it as an error handler, and MUST be registered last.
 *
 * Maps known error shapes onto the API envelope: AppError (operational),
 * Mongoose ValidationError → 400, and MongoDB duplicate-key (11000) → 409.
 */
const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	let statusCode: number = INTERNAL_SERVER_ERROR;
	let errorCode: string = INTERNAL_ERROR;
	let message = "Something went wrong";

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		errorCode = err.errorCode;
		message = err.message;
	} else if (err instanceof mongoose.Error.ValidationError) {
		statusCode = BAD_REQUEST;
		errorCode = VALIDATION_ERROR;
		message = Object.values(err.errors)
			.map((e) => e.message)
			.join("; ");
	} else if (
		err instanceof mongoose.mongo.MongoServerError &&
		err.code === 11000
	) {
		statusCode = CONFLICT;
		errorCode = USER_ALREADY_EXISTS;
		message = "A record with that value already exists";
	}

	const status = statusCode >= 500 ? "error" : "fail";

	// Log only genuinely unexpected (unhandled, 5xx) errors.
	const isHandled = err instanceof AppError || statusCode < 500;
	if (!isHandled) console.error("[GLOBAL ERROR HANDLER]", err);

	const response: {
		status: string;
		error: { code: string; message: string };
		stack?: string;
	} = {
		status,
		error: { code: errorCode, message },
	};

	// Expose the stack trace only outside production.
	if (NODE_ENV === "development" && err instanceof Error) {
		response.stack = err.stack;
	}

	res.status(statusCode).json(response);
};

export default globalErrorHandler;

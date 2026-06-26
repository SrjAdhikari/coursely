//* src/middlewares/error.middleware.ts

import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";
import envConfig from "../constants/env";

const { NODE_ENV } = envConfig;
const { BAD_REQUEST, NOT_FOUND, CONFLICT, INTERNAL_SERVER_ERROR } = httpStatus;
const { INTERNAL_ERROR, VALIDATION_ERROR, DUPLICATE_KEY, RESOURCE_NOT_FOUND } =
	appErrorCode;

/** The envelope fields every resolver produces and the handler renders. */
interface ErrorResolution {
	statusCode: number;
	errorCode: string;
	message: string;
}

/** Inspect an error; return a resolution if this rule applies, else null. */
type ErrorResolver = (err: unknown) => ErrorResolution | null;

/** Operational errors we threw on purpose carry their own envelope. */
const fromAppError: ErrorResolver = (err) => {
	if (!(err instanceof AppError)) return null;
	return {
		statusCode: err.statusCode,
		errorCode: err.errorCode,
		message: err.message,
	};
};

/** Schema validation failed → 400 with the joined field messages. */
const fromValidationError: ErrorResolver = (err) => {
	if (!(err instanceof mongoose.Error.ValidationError)) return null;
	return {
		statusCode: BAD_REQUEST,
		errorCode: VALIDATION_ERROR,
		message: Object.values(err.errors)
			.map((e) => e.message)
			.join("; "),
	};
};

/**
 * A malformed ObjectId (a bad route `:id`) → 404 not-found. Any other cast
 * failure is bad client input, so → 400 instead of masquerading as not-found.
 */
const fromCastError: ErrorResolver = (err) => {
	if (!(err instanceof mongoose.Error.CastError)) return null;
	if (err.kind === "ObjectId") {
		return {
			statusCode: NOT_FOUND,
			errorCode: RESOURCE_NOT_FOUND,
			message: "The requested resource was not found",
		};
	}
	return {
		statusCode: BAD_REQUEST,
		errorCode: VALIDATION_ERROR,
		message: `Invalid value for ${err.path}`,
	};
};

/** A duplicate unique key (e.g. email/slug already taken) → 409. */
const fromDuplicateKey: ErrorResolver = (err) => {
	if (!(err instanceof mongoose.mongo.MongoServerError) || err.code !== 11000) {
		return null;
	}
	return {
		statusCode: CONFLICT,
		errorCode: DUPLICATE_KEY,
		message: "A record with that value already exists",
	};
};

/**
 * Ordered error-mapping rules — the first that matches wins. To handle a new
 * error shape, write a `fromX` resolver above and add it to this list; the
 * handler itself never changes.
 */
const errorResolvers: ErrorResolver[] = [
	fromAppError,
	fromValidationError,
	fromCastError,
	fromDuplicateKey,
];

/** Fallback for anything no resolver claims — an unexpected 5xx. */
const UNHANDLED_ERROR: ErrorResolution = {
	statusCode: INTERNAL_SERVER_ERROR,
	errorCode: INTERNAL_ERROR,
	message: "Something went wrong",
};

/** Walk the rules in order and return the first match, or the 5xx fallback. */
const resolveError = (err: unknown): ErrorResolution => {
	for (const resolve of errorResolvers) {
		const resolution = resolve(err);
		if (resolution) return resolution;
	}
	return UNHANDLED_ERROR;
};

/**
 * Global error handling middleware for Express 5.
 * Maps known error shapes onto the API envelope via `errorResolvers`;
 * anything unmatched becomes a logged 500.
 */
const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	const { statusCode, errorCode, message } = resolveError(err);

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

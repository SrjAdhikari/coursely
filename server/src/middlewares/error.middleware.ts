//* src/middlewares/error.middleware.ts

import type { ErrorRequestHandler } from "express";
import AppError from "../errors/AppError";
import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";
import envConfig from "../constants/env";

const { NODE_ENV } = envConfig;
const { INTERNAL_SERVER_ERROR } = httpStatus;
const { INTERNAL_ERROR } = appErrorCode;

/**
 * Global error handling middleware for Express 5. MUST keep all four params so
 * Express recognizes it as an error handler, and MUST be registered last.
 *
 * Mongoose/MongoDB error mapping (CastError, ValidationError, duplicate-key)
 * arrives with the first models in a later phase.
 */
const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	const isAppError = err instanceof AppError;

	const statusCode = isAppError ? err.statusCode : INTERNAL_SERVER_ERROR;

	const errorCode = isAppError ? err.errorCode : INTERNAL_ERROR;
	const message = isAppError ? err.message : "Something went wrong";
	const status = statusCode >= 500 ? "error" : "fail";

	if (!isAppError) console.error("[GLOBAL ERROR HANDLER]", err);

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

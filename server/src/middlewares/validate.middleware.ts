//* src/middlewares/validate.middleware.ts

import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { BAD_REQUEST } = httpStatus;
const { VALIDATION_ERROR } = appErrorCode;

/**
 * Builds a middleware that validates `req.body` against a Zod schema.
 *
 * On success the parsed (and normalized) data replaces `req.body` so trimming,
 * lowercasing, and type coercion flow downstream. On failure it throws an
 * AppError that the global error handler converts to a 400 response.
 */
const validateBody =
	(schema: ZodType): RequestHandler =>
	(req, _res, next) => {
		const result = schema.safeParse(req.body ?? {});

		if (!result.success) {
			const message = result.error.issues
				.map((issue) => issue.message)
				.join("; ");
			throw new AppError(message, BAD_REQUEST, VALIDATION_ERROR);
		}

		req.body = result.data;
		next();
	};

export default validateBody;

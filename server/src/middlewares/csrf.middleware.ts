//* src/middlewares/csrf.middleware.ts

import type { RequestHandler } from "express";

import AppError from "../errors/AppError";
import envConfig from "../constants/env";
import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { APP_ORIGIN } = envConfig;
const { FORBIDDEN } = httpStatus;
const { CSRF_ORIGIN_MISMATCH } = appErrorCode;

// GET/HEAD/OPTIONS don't change state, so they need no origin check.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// The origin of a Referer URL, or undefined if absent/unparseable.
const refererOrigin = (referer: string | undefined): string | undefined => {
	if (!referer) return undefined;
	try {
		return new URL(referer).origin;
	} catch {
		return undefined;
	}
};

// CSRF guard for mutations: the request Origin (or Referer origin) must match
// APP_ORIGIN. Absent both is allowed (non-browser request, carries no cookie).
const verifyRequestOrigin: RequestHandler = (req, _res, next) => {
	if (SAFE_METHODS.has(req.method)) {
		next();
		return;
	}

	const requestOrigin = req.get("origin") ?? refererOrigin(req.get("referer"));

	if (requestOrigin !== undefined && requestOrigin !== APP_ORIGIN) {
		throw new AppError(
			"Request origin not allowed",
			FORBIDDEN,
			CSRF_ORIGIN_MISMATCH,
		);
	}

	next();
};

export default verifyRequestOrigin;

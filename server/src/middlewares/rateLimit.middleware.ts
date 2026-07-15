//* src/middlewares/rateLimit.middleware.ts

import type { Request, RequestHandler } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

import { FIFTEEN_MINUTES_MS } from "../utils/date";

const { TOO_MANY_REQUESTS } = httpStatus;
const { RATE_LIMITED } = appErrorCode;

type RateLimitConfig = { windowMs: number; limit: number };

// Tiered key: authed users by id, anonymous by req.ip (trust-proxy-safe,
// not the spoofable cf-connecting-ip header; IPv6 masked to /56).
const clientKey = (req: Request): string => {
	if (req.user?.id) return req.user.id;
	return ipKeyGenerator(req.ip ?? "unknown", 56);
};

/**
 * Converts express-rate-limit's 429 into the project error envelope by routing
 * an AppError through the global error handler — instead of the library's
 * default plaintext "Too many requests" body, which breaks the response contract.
 */
const rateLimitExceededHandler: RequestHandler = (_req, _res, next) => {
	next(
		new AppError(
			"Too many requests, please try again later",
			TOO_MANY_REQUESTS,
			RATE_LIMITED,
		),
	);
};

/** Per-tier windows + per-key request caps. */
const RATE_LIMITS = {
	global: { windowMs: FIFTEEN_MINUTES_MS, limit: 1000 },
	auth: { windowMs: FIFTEEN_MINUTES_MS, limit: 10 },
};

const createLimiter = ({ windowMs, limit }: RateLimitConfig) =>
	rateLimit({
		windowMs,
		limit,
		standardHeaders: true,
		legacyHeaders: false,
		keyGenerator: clientKey,
		handler: rateLimitExceededHandler,
	});

const globalLimiter = createLimiter(RATE_LIMITS.global);
const authLimiter = createLimiter(RATE_LIMITS.auth);

export { clientKey, rateLimitExceededHandler, globalLimiter, authLimiter };

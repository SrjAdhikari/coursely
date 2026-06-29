//* src/middlewares/auth.middleware.ts

import type { RequestHandler } from "express";

import Session from "../models/session.model";
import { toPublicUser, type UserDocument } from "../models/user.model";

import { SESSION_COOKIE_NAME, clearSessionCookie } from "../utils/cookies";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { UNAUTHORIZED, FORBIDDEN } = httpStatus;
const { UNAUTHORIZED_ACCESS, ACCOUNT_DEACTIVATED } = appErrorCode;

/** The user fields the auth middlewares need from the session — never the password. */
type SessionUser = Pick<
	UserDocument,
	"_id" | "name" | "email" | "role" | "isActive"
>;

/** Load a session with its user populated in one round-trip (never the password). */
const findSessionWithUser = (sessionId: string) =>
	Session.findById(sessionId)
		.populate<{
			userId: SessionUser | null;
		}>("userId", "name email role isActive")
		.lean();

/**
 * Require a valid session: read the signed cookie, load the session and its
 * user in one round-trip, then attach `req.user` + `req.sessionId`. Clears the
 * cookie on any invalid/expired/deactivated state. (TTL reaping is eventual, so
 * `expiresAt` is also checked explicitly.)
 */
const authenticate: RequestHandler = async (req, res, next) => {
	const sessionId = req.signedCookies[SESSION_COOKIE_NAME] as
		| string
		| undefined;

	if (!sessionId) {
		throw new AppError(
			"Authentication required",
			UNAUTHORIZED,
			UNAUTHORIZED_ACCESS,
		);
	}

	const session = await findSessionWithUser(sessionId);

	// Missing/expired session, or a user that no longer exists.
	if (
		!session ||
		!session.userId ||
		session.expiresAt.getTime() <= Date.now()
	) {
		clearSessionCookie(res);
		throw new AppError(
			"Invalid or expired session",
			UNAUTHORIZED,
			UNAUTHORIZED_ACCESS,
		);
	}

	const user = session.userId;
	if (!user.isActive) {
		clearSessionCookie(res);
		throw new AppError(
			"Your account has been deactivated",
			FORBIDDEN,
			ACCOUNT_DEACTIVATED,
		);
	}

	req.user = toPublicUser(user);
	req.sessionId = session._id.toString();

	next();
};

/**
 * Best-effort authentication: if a valid, active, unexpired session cookie is
 * present, attach `req.user` (+ `req.sessionId`); otherwise continue anonymously.
 * Never throws — used by routes that serve both public and authenticated callers
 * (e.g. lesson playback: preview is ungated, paid is enrollment-gated).
 */
const optionalAuth: RequestHandler = async (req, _res, next) => {
	const sessionId = req.signedCookies[SESSION_COOKIE_NAME] as
		| string
		| undefined;
	if (!sessionId) return next();

	try {
		const session = await findSessionWithUser(sessionId);

		if (
			session &&
			session.userId &&
			session.userId.isActive &&
			session.expiresAt.getTime() > Date.now()
		) {
			req.user = toPublicUser(session.userId);
			req.sessionId = session._id.toString();
		}
	} catch {
		// Best-effort auth: a session-store failure must not break public routes —
		// degrade to anonymous rather than throwing.
	}

	next();
};

export default authenticate;
export { optionalAuth };

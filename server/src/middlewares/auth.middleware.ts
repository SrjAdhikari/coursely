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

/** The user fields `authenticate` needs from the session — never the password. */
type SessionUser = Pick<
	UserDocument,
	"_id" | "name" | "email" | "role" | "isActive"
>;

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

	// One round-trip; project only the fields we need — never the password.
	const session = await Session.findById(sessionId)
		.populate<{ userId: SessionUser | null }>(
			"userId",
			"name email role isActive",
		)
		.lean();

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

export default authenticate;

//* src/middlewares/optionalAuth.middleware.ts

import type { RequestHandler } from "express";

import Session from "../models/session.model";
import { toPublicUser, type UserDocument } from "../models/user.model";

import { SESSION_COOKIE_NAME } from "../utils/cookies";

/** The user fields we attach — never the password. */
type SessionUser = Pick<
	UserDocument,
	"_id" | "name" | "email" | "role" | "isActive"
>;

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

	const session = await Session.findById(sessionId)
		.populate<{ userId: SessionUser | null }>(
			"userId",
			"name email role isActive",
		)
		.lean();

	if (
		session &&
		session.userId &&
		session.userId.isActive &&
		session.expiresAt.getTime() > Date.now()
	) {
		req.user = toPublicUser(session.userId);
		req.sessionId = session._id.toString();
	}

	next();
};

export default optionalAuth;

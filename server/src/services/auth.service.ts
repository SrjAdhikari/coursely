//* src/services/auth.service.ts

import mongoose from "mongoose";

import User from "../models/user.model";
import Session from "../models/session.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { UNAUTHORIZED, FORBIDDEN } = httpStatus;
const { INVALID_CREDENTIALS, ACCOUNT_DEACTIVATED } = appErrorCode;

/** A unique-index violation specifically on the email field (email taken). */
const isEmailAlreadyTaken = (error: unknown): boolean =>
	error instanceof mongoose.mongo.MongoServerError &&
	error.code === 11000 &&
	error.keyPattern?.email !== undefined;

/**
 * Create a student account (no session — the client logs in next). The reply is
 * identical for a new vs. a taken email, so it can't be used to enumerate accounts.
 */
const registerUser = async (
	name: string,
	email: string,
	password: string,
): Promise<void> => {
	try {
		await User.create({ name, email, password });
	} catch (error) {
		// Taken email → swallow to keep the reply generic. Any other error (incl. a
		// duplicate on a different unique index) still throws to the error handler.
		if (isEmailAlreadyTaken(error)) return;
		throw error;
	}
};

/**
 * Verify credentials and mint a NEW session (id regenerated → fixation defense).
 * Returns the new session id.
 */
const loginUser = async (email: string, password: string): Promise<string> => {
	const user = await User.findOne({ email }).select("+password");

	// Same generic error for unknown-email and wrong-password (no enumeration).
	if (!user || !(await user.comparePassword(password))) {
		throw new AppError(
			"Invalid email or password",
			UNAUTHORIZED,
			INVALID_CREDENTIALS,
		);
	}

	if (!user.isActive) {
		throw new AppError(
			"Your account has been deactivated",
			FORBIDDEN,
			ACCOUNT_DEACTIVATED,
		);
	}

	const session = await Session.create({ userId: user._id });
	return session._id.toString();
};

/** Destroy a session server-side (logout). No-op if it is already gone. */
const logoutUser = async (sessionId: string): Promise<void> => {
	if (sessionId) {
		await Session.findByIdAndDelete(sessionId);
	}
};

export { registerUser, loginUser, logoutUser };

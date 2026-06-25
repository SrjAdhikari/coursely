//* src/services/auth.service.ts

import mongoose from "mongoose";

import User from "../models/user.model";
import Session from "../models/session.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { CONFLICT, UNAUTHORIZED, FORBIDDEN } = httpStatus;
const { USER_ALREADY_EXISTS, INVALID_CREDENTIALS, ACCOUNT_DEACTIVATED } =
	appErrorCode;

/**
 * Create a student account + a fresh session atomically (one transaction —
 * either both commit or neither, so a failure can't orphan an account).
 * Returns the new session id (the value carried in the auth cookie).
 */
const registerUser = async (
	name: string,
	email: string,
	password: string,
): Promise<string> => {
	const existing = await User.findOne({ email });
	if (existing) {
		throw new AppError(
			"An account with this email already exists",
			CONFLICT,
			USER_ALREADY_EXISTS,
		);
	}

	const dbSession = await mongoose.startSession();
	try {
		let sessionId = "";
		await dbSession.withTransaction(async () => {
			const user = new User({ name, email, password });
			await user.save({ session: dbSession });

			const authSession = new Session({ userId: user._id });
			await authSession.save({ session: dbSession });

			sessionId = authSession._id.toString();
		});
		return sessionId;
	} finally {
		await dbSession.endSession();
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

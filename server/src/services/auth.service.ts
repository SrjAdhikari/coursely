//* src/services/auth.service.ts

import User, { toPublicUser, type PublicUser } from "../models/user.model";
import Session from "../models/session.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

import type { RegisterInput, LoginInput } from "../validators/auth.validator";

const { CONFLICT, UNAUTHORIZED, FORBIDDEN } = httpStatus;
const { USER_ALREADY_EXISTS, INVALID_CREDENTIALS, ACCOUNT_DEACTIVATED } =
	appErrorCode;

interface AuthResult {
	user: PublicUser;
	sessionId: string;
}

/** Create a student account + a fresh session. */
const registerUser = async ({
	name,
	email,
	password,
}: RegisterInput): Promise<AuthResult> => {
	const existing = await User.findOne({ email });
	if (existing) {
		throw new AppError(
			"An account with this email already exists",
			CONFLICT,
			USER_ALREADY_EXISTS,
		);
	}

	// The User model's pre-save hook hashes the raw password.
	const user = await User.create({ name, email, password });
	const session = await Session.create({ userId: user._id });

	return { user: toPublicUser(user), sessionId: session._id.toString() };
};

/** Verify credentials and mint a NEW session. */
const loginUser = async ({
	email,
	password,
}: LoginInput): Promise<AuthResult> => {
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
	return { user: toPublicUser(user), sessionId: session._id.toString() };
};

/** Destroy a session server-side (logout). */
const logoutUser = async (sessionId: string): Promise<void> => {
	if (sessionId) {
		await Session.findByIdAndDelete(sessionId);
	}
};

export { registerUser, loginUser, logoutUser };

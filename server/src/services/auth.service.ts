//* src/services/auth.service.ts

import mongoose from "mongoose";

import User from "../models/user.model";
import Session from "../models/session.model";

import { createToken } from "../utils/token";
import verifyGoogleIdToken from "../lib/googleAuth";
import sanitizeInput from "../utils/sanitizeInput";
import createAppLink from "../utils/createAppLink";
import AppError from "../errors/AppError";

import { issueToken, consumeToken, isTokenOnCooldown } from "./token.service";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.service";
import { ONE_MINUTE_MS } from "../utils/date";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { UNAUTHORIZED, FORBIDDEN, CONFLICT, BAD_REQUEST } = httpStatus;
const {
	INVALID_CREDENTIALS,
	ACCOUNT_DEACTIVATED,
	GOOGLE_EMAIL_NOT_VERIFIED,
	PROVIDER_MISMATCH,
	EMAIL_NOT_VERIFIED,
	INVALID_OR_EXPIRED_TOKEN,
} = appErrorCode;

/** A unique-index violation specifically on the email field (email taken). */
const isEmailAlreadyTaken = (error: unknown): boolean =>
	error instanceof mongoose.mongo.MongoServerError &&
	error.code === 11000 &&
	error.keyPattern?.email !== undefined;

/**
 * Create an unverified student account, then email a verification link. The reply
 * is identical for a new vs. a taken email, so it can't be used to enumerate accounts.
 */
const registerUser = async (
	name: string,
	email: string,
	password: string,
): Promise<void> => {
	let user;

	try {
		user = await User.create({ name, email, password });
	} catch (error) {
		// Taken email → swallow to keep the reply generic. Any other error (incl. a
		// duplicate on a different unique index) still throws to the error handler.
		if (isEmailAlreadyTaken(error)) return;
		throw error;
	}

	const rawToken = await issueToken(user._id, "email_verification");
	await sendVerificationEmail(
		name,
		email,
		createAppLink("verify-email", rawToken),
	);
};

/** Verify credentials and mint a fresh session token (only its hash is stored). */
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

	if (!user.isVerified) {
		throw new AppError(
			"Please verify your email address",
			FORBIDDEN,
			EMAIL_NOT_VERIFIED,
		);
	}

	const { token, tokenHash } = createToken();
	await Session.create({ userId: user._id, tokenHash });

	return token;
};

/** Sign in or sign up with a verified Google identity; refuses password accounts. */
const loginOrCreateGoogleUser = async (
	idToken: string,
): Promise<{ token: string; isNewUser: boolean }> => {
	const { email, name, emailVerified, avatarUrl } =
		await verifyGoogleIdToken(idToken);

	if (!emailVerified) {
		throw new AppError(
			"Your Google email address is not verified",
			FORBIDDEN,
			GOOGLE_EMAIL_NOT_VERIFIED,
		);
	}

	const existingUser = await User.findOne({ email });

	// A same-email password account isn't linked automatically (pre-hijacking guard).
	if (existingUser && existingUser.provider !== "google") {
		throw new AppError(
			"This email is registered with a password. Please log in with your password.",
			CONFLICT,
			PROVIDER_MISMATCH,
		);
	}

	if (existingUser && !existingUser.isActive) {
		throw new AppError(
			"Your account has been deactivated",
			FORBIDDEN,
			ACCOUNT_DEACTIVATED,
		);
	}

	// Reuse the existing Google user, or create one on a first-time sign-in.
	let user = existingUser;
	if (!user) {
		const displayName = sanitizeInput(name).slice(0, 50);
		user = await User.create({
			name: displayName,
			email,
			provider: "google",
			avatarUrl,
			isVerified: true,
		});
	}

	const { token, tokenHash } = createToken();
	await Session.create({ userId: user._id, tokenHash });

	return { token, isNewUser: !existingUser };
};

/** Destroy a session server-side (logout). No-op if it is already gone. */
const logoutUser = async (sessionId: string): Promise<void> => {
	if (sessionId) {
		await Session.findByIdAndDelete(sessionId);
	}
};

/** Verify an account from an email-verification token (single-use). */
const verifyEmail = async (token: string): Promise<void> => {
	const userId = await consumeToken(token, "email_verification");
	await User.updateOne({ _id: userId }, { $set: { isVerified: true } });
};

/** Re-send an email-verification link if the user exists and is not verified. */
const resendVerificationLink = async (email: string): Promise<void> => {
	const user = await User.findOne({ email });
	if (!user || user.provider !== "email" || user.isVerified) return;

	// Don't send a new link if one is already on cooldown.
	const onCooldown = await isTokenOnCooldown(
		user._id,
		"email_verification",
		ONE_MINUTE_MS,
	);
	if (onCooldown) return;

	const rawToken = await issueToken(user._id, "email_verification");
	await sendVerificationEmail(
		user.name,
		email,
		createAppLink("verify-email", rawToken),
	);
};

/** Send a password-reset link if the user exists and signed up with a password. */
const forgotPassword = async (email: string): Promise<void> => {
	const user = await User.findOne({ email });
	if (!user || user.provider !== "email") return;

	// Don't send a new link if one is already on cooldown.
	const onCooldown = await isTokenOnCooldown(
		user._id,
		"password_reset",
		ONE_MINUTE_MS,
	);
	if (onCooldown) return;

	const rawToken = await issueToken(user._id, "password_reset");
	await sendPasswordResetEmail(
		user.name,
		email,
		createAppLink("reset-password", rawToken),
	);
};

/**
 * Reset a user's password from a password-reset token (single-use). 
 * This also verifies the account and destroys all existing sessions.
 */
const resetPassword = async (
	token: string,
	newPassword: string,
): Promise<void> => {
	const session = await mongoose.startSession();

	try {
		await session.withTransaction(async () => {
			const userId = await consumeToken(token, "password_reset", session);

			const user = await User.findById(userId).session(session);
			if (!user) {
				throw new AppError(
					"This link is invalid or has expired",
					BAD_REQUEST,
					INVALID_OR_EXPIRED_TOKEN,
				);
			}

			user.password = newPassword;
			user.isVerified = true;

			await user.save({ session });
			await Session.deleteMany({ userId }, { session });
		});
	} finally {
		await session.endSession();
	}
};

export {
	registerUser,
	loginUser,
	logoutUser,
	loginOrCreateGoogleUser,
	verifyEmail,
	resendVerificationLink,
	forgotPassword,
	resetPassword,
};

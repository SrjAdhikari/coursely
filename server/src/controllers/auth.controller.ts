//* src/controllers/auth.controller.ts

import type { RequestHandler } from "express";

import {
	registerUser,
	loginUser,
	logoutUser,
	loginOrCreateGoogleUser,
	verifyEmail,
	resendVerificationLink,
	forgotPassword,
	resetPassword,
} from "../services/auth.service";
import { setSessionCookie, clearSessionCookie } from "../utils/cookies";

import httpStatus from "../constants/httpStatus";

const { OK, CREATED } = httpStatus;

const registerHandler: RequestHandler = async (req, res) => {
	const { name, email, password } = req.body;
	await registerUser(name, email, password);

	// No session cookie here — the client logs in next, so the register response
	// is identical for a new and an already-registered email (no enumeration).
	res.status(CREATED).json({
		success: true,
		message: "Account created successfully",
	});
};

const loginHandler: RequestHandler = async (req, res) => {
	const { email, password } = req.body;
	const sessionToken = await loginUser(email, password);

	setSessionCookie(res, sessionToken);

	res.status(OK).json({
		success: true,
		message: "Logged in successfully",
	});
};

const googleOAuthHandler: RequestHandler = async (req, res) => {
	const { idToken } = req.body;
	const { token, isNewUser } = await loginOrCreateGoogleUser(idToken);

	setSessionCookie(res, token);

	res.status(isNewUser ? CREATED : OK).json({
		success: true,
		message: isNewUser
			? "Account created successfully"
			: "Logged in successfully",
	});
};

const logoutHandler: RequestHandler = async (req, res) => {
	// `authenticate` runs first and attaches the validated session id.
	if (req.sessionId) await logoutUser(req.sessionId);

	clearSessionCookie(res);

	res.status(OK).json({ success: true, message: "Logged out successfully" });
};

const getCurrentUserHandler: RequestHandler = (req, res) => {
	res.status(OK).json({
		success: true,
		message: "User fetched successfully",
		data: req.user,
	});
};

const verifyEmailHandler: RequestHandler = async (req, res) => {
	const { token } = req.body;
	await verifyEmail(token);

	res.status(OK).json({
		success: true,
		message: "Email verified. You can now log in.",
	});
};

const resendVerificationHandler: RequestHandler = async (req, res) => {
	const { email } = req.body;
	await resendVerificationLink(email);

	// Same reply whether or not the account exists (no enumeration).
	res.status(OK).json({
		success: true,
		message: "If your account needs verifying, check your inbox for a new link.",
	});
};

const forgotPasswordHandler: RequestHandler = async (req, res) => {
	const { email } = req.body;
	await forgotPassword(email);

	// Same reply whether or not the account exists (no enumeration).
	res.status(OK).json({
		success: true,
		message:
			"If an account exists for that email, check your inbox for a reset link.",
	});
};

const resetPasswordHandler: RequestHandler = async (req, res) => {
	const { token, newPassword } = req.body;
	await resetPassword(token, newPassword);

	res.status(OK).json({
		success: true,
		message: "Password reset. Please log in.",
	});
};

export {
	registerHandler,
	loginHandler,
	googleOAuthHandler,
	logoutHandler,
	getCurrentUserHandler,
	verifyEmailHandler,
	resendVerificationHandler,
	forgotPasswordHandler,
	resetPasswordHandler,
};

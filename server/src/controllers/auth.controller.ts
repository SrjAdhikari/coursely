//* src/controllers/auth.controller.ts

import type { RequestHandler } from "express";

import { registerUser, loginUser, logoutUser } from "../services/auth.service";
import { setSessionCookie, clearSessionCookie } from "../utils/cookies";

import httpStatus from "../constants/httpStatus";

const { OK, CREATED } = httpStatus;

const registerHandler: RequestHandler = async (req, res) => {
	const { name, email, password } = req.body;
	const sessionId = await registerUser(name, email, password);

	setSessionCookie(res, sessionId);

	res.status(CREATED).json({
		success: true,
		message: "Account created successfully",
	});
};

const loginHandler: RequestHandler = async (req, res) => {
	const { email, password } = req.body;
	const sessionId = await loginUser(email, password);

	setSessionCookie(res, sessionId);

	res.status(OK).json({
		success: true,
		message: "Logged in successfully",
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

export { registerHandler, loginHandler, logoutHandler, getCurrentUserHandler };

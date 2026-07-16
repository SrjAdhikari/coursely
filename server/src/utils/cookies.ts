//* src/utils/cookies.ts

import type { CookieOptions, Response } from "express";
import envConfig from "../constants/env";
import { SEVEN_DAYS_MS } from "./date";

const { NODE_ENV } = envConfig;
const isProd = NODE_ENV === "production";
const SESSION_COOKIE_NAME = "sid";

const baseOptions: CookieOptions = {
	httpOnly: true,
	signed: true,
	sameSite: isProd ? "none" : "lax",
	secure: isProd,
	path: "/",
};

const setSessionCookie = (res: Response, sessionToken: string): void => {
	res.cookie(SESSION_COOKIE_NAME, sessionToken, {
		...baseOptions,
		maxAge: SEVEN_DAYS_MS,
	});
};

const clearSessionCookie = (res: Response): void => {
	res.clearCookie(SESSION_COOKIE_NAME, baseOptions);
};

export { SESSION_COOKIE_NAME, setSessionCookie, clearSessionCookie };

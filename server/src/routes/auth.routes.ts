//* src/routes/auth.routes.ts

/**
 * Authentication Routes
 * @module routes/auth
 */

import { Router } from "express";

import {
	registerHandler,
	loginHandler,
	googleOAuthHandler,
	logoutHandler,
	getCurrentUserHandler,
	verifyEmailHandler,
	resendVerificationHandler,
	forgotPasswordHandler,
	resetPasswordHandler,
} from "../controllers/auth.controller";

import authenticate from "../middlewares/auth.middleware";
import validateBody from "../middlewares/validate.middleware";
import { authLimiter } from "../middlewares/rateLimit.middleware";

import {
	registerSchema,
	loginSchema,
	googleOAuthSchema,
	verifyEmailSchema,
	resendVerificationSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
} from "../validators/auth.validator";

const authRouter = Router();

/**
 * Register a new student account
 * @route POST /api/auth/register
 */
authRouter.post(
	"/register",
	authLimiter,
	validateBody(registerSchema),
	registerHandler,
);

/**
 * Log in an existing user
 * @route POST /api/auth/login
 */
authRouter.post("/login", authLimiter, validateBody(loginSchema), loginHandler);

/**
 * Sign in or sign up with a Google ID token
 * @route POST /api/auth/google
 */
authRouter.post(
	"/google",
	authLimiter,
	validateBody(googleOAuthSchema),
	googleOAuthHandler,
);

/**
 * Log out the current user
 * @route POST /api/auth/logout
 */
authRouter.post("/logout", authenticate, logoutHandler);

/**
 * Get the authenticated user's profile
 * @route GET /api/auth/me
 */
authRouter.get("/me", authenticate, getCurrentUserHandler);

/**
 * Verify an account's email address from a token
 * @route POST /api/auth/verify-email
 */
authRouter.post(
	"/verify-email",
	authLimiter,
	validateBody(verifyEmailSchema),
	verifyEmailHandler,
);

/**
 * Re-send the account verification link
 * @route POST /api/auth/resend-verification
 */
authRouter.post(
	"/resend-verification",
	authLimiter,
	validateBody(resendVerificationSchema),
	resendVerificationHandler,
);

/**
 * Send a password reset link to the user's email
 * @route POST /api/auth/forgot-password
 */
authRouter.post(
	"/forgot-password",
	authLimiter,
	validateBody(forgotPasswordSchema),
	forgotPasswordHandler,
);

/**
 * Reset a user's password from a token
 * @route POST /api/auth/reset-password
 */
authRouter.post(
	"/reset-password",
	authLimiter,
	validateBody(resetPasswordSchema),
	resetPasswordHandler,
);

export default authRouter;

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
} from "../controllers/auth.controller";

import authenticate from "../middlewares/auth.middleware";
import validateBody from "../middlewares/validate.middleware";
import { authLimiter } from "../middlewares/rateLimit.middleware";

import {
	registerSchema,
	loginSchema,
	googleOAuthSchema,
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

export default authRouter;

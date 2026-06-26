//* src/routes/index.ts

/**
 * Root router for all application endpoints.
 * @module routes
 */

import { Router } from "express";
import authRouter from "./auth.routes";
import courseRouter from "./course.routes";

const router = Router();

/**
 * Authentication routes
 * @route /api/auth
 */
router.use("/auth", authRouter);

/**
 * Public catalog routes
 * @route /api/courses
 */
router.use("/courses", courseRouter);

export default router;

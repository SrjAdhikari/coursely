//* src/routes/index.ts

/**
 * Root router for all application endpoints.
 * @module routes
 */

import { Router } from "express";
import authRouter from "./auth.routes";
import { publicCourseRouter } from "./course.routes";
import { publicLessonRouter } from "./lesson.routes";
import adminRouter from "./admin.routes";

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
router.use("/courses", publicCourseRouter);

/**
 * Public lesson media routes
 * @route /api/lessons
 */
router.use("/lessons", publicLessonRouter);

/**
 * Admin routes (authenticated admin only)
 * @route /api/admin
 */
router.use("/admin", adminRouter);

export default router;

//* src/routes/index.ts

/**
 * Root router for all application endpoints.
 * @module routes
 */

import { Router } from "express";
import authRouter from "./auth.routes";
import { publicCourseRouter } from "./course.routes";
import { publicLessonRouter } from "./lesson.routes";
import { paymentRouter } from "./payment.routes";
import { enrollmentRouter } from "./enrollment.routes";
import { progressRouter } from "./progress.routes";
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
 * Checkout routes (authenticated student)
 * @route /api/checkout
 */
router.use("/checkout", paymentRouter);

/**
 * Enrollment routes (authenticated student)
 * @route /api/enrollments
 */
router.use("/enrollments", enrollmentRouter);

/**
 * Progress routes (authenticated learner)
 * @route /api/progress
 */
router.use("/progress", progressRouter);

/**
 * Admin routes (authenticated admin only)
 * @route /api/admin
 */
router.use("/admin", adminRouter);

export default router;

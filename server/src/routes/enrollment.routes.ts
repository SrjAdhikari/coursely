//* src/routes/enrollment.routes.ts

/**
 * Enrollment Routes — the student's own enrollments and the admin enrollment list.
 * @module routes/enrollment
 */

import { Router } from "express";

import {
	getMyEnrollmentsHandler,
	listEnrollmentsHandler,
} from "../controllers/enrollment.controller";

import authenticate from "../middlewares/auth.middleware";

/** Student enrollment router — mounted at /api/enrollments */
const enrollmentRouter = Router();

/** Admin enrollment router — mounted inside adminRouter at /api/admin */
const adminEnrollmentRouter = Router();

/**
 * The caller's own enrollments
 * @route GET /api/enrollments/me
 */
enrollmentRouter.get("/me", authenticate, getMyEnrollmentsHandler);

/**
 * List all enrollments (paginated)
 * @route GET /api/admin/enrollments
 */
adminEnrollmentRouter.get("/enrollments", listEnrollmentsHandler);

export default adminEnrollmentRouter;
export { enrollmentRouter };

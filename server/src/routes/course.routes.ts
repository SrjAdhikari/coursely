//* src/routes/course.routes.ts

/**
 * Course Routes — public catalog and admin course management.
 * @module routes/course
 */

import { Router } from "express";

import {
	listCoursesHandler,
	getCourseBySlugHandler,
	listAllCoursesHandler,
	getCourseByIdHandler,
	createCourseHandler,
	updateCourseHandler,
	deleteCourseHandler,
} from "../controllers/course.controller";

import validateBody from "../middlewares/validate.middleware";

import {
	createCourseSchema,
	updateCourseSchema,
} from "../validators/course.validator";

/** Public catalog router — mounted at /api/courses */
const courseRouter = Router();

/**
 * List published courses (optional ?q= text search)
 * @route GET /api/courses
 */
courseRouter.get("/", listCoursesHandler);

/**
 * Get a published course + curriculum by slug
 * @route GET /api/courses/:slug
 */
courseRouter.get("/:slug", getCourseBySlugHandler);

/** Admin course router — mounted inside adminRouter at /api/admin */
const adminCourseRouter = Router();

/**
 * List all courses (drafts + published)
 * @route GET /api/admin/courses
 */
adminCourseRouter.get("/courses", listAllCoursesHandler);

/**
 * Get a course + full curriculum by id
 * @route GET /api/admin/courses/:id
 */
adminCourseRouter.get("/courses/:id", getCourseByIdHandler);

/**
 * Create a new course
 * @route POST /api/admin/courses
 */
adminCourseRouter.post(
	"/courses",
	validateBody(createCourseSchema),
	createCourseHandler,
);

/**
 * Update an existing course
 * @route PATCH /api/admin/courses/:id
 */
adminCourseRouter.patch(
	"/courses/:id",
	validateBody(updateCourseSchema),
	updateCourseHandler,
);

/**
 * Delete a course
 * @route DELETE /api/admin/courses/:id
 */
adminCourseRouter.delete("/courses/:id", deleteCourseHandler);

export default courseRouter;
export { adminCourseRouter };

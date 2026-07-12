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
import {
	getCourseTrailerUrlHandler,
	createCourseTrailerUploadUrlHandler,
	setCourseTrailerHandler,
	createCourseThumbnailUploadUrlHandler,
	setCourseThumbnailHandler,
} from "../controllers/media.controller";

import validateBody from "../middlewares/validate.middleware";

import {
	createCourseSchema,
	updateCourseSchema,
} from "../validators/course.validator";
import { createThumbnailUploadUrlSchema } from "../validators/media.validator";

/** Public catalog router — mounted at /api/courses */
const publicCourseRouter = Router();

/** Admin course router — mounted inside adminRouter at /api/admin */
const adminCourseRouter = Router();

/**
 * List published courses (optional ?q= text search)
 * @route GET /api/courses
 */
publicCourseRouter.get("/", listCoursesHandler);

/**
 * Mint an ungated signed GET for a course trailer
 * @route GET /api/courses/:slug/trailer-url
 */
publicCourseRouter.get("/:slug/trailer-url", getCourseTrailerUrlHandler);

/**
 * Get a published course + curriculum by slug
 * @route GET /api/courses/:slug
 */
publicCourseRouter.get("/:slug", getCourseBySlugHandler);

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

/**
 * Mint a presigned PUT for a course trailer
 * @route POST /api/admin/courses/:id/trailer-url
 */
adminCourseRouter.post(
	"/courses/:id/trailer-url",
	createCourseTrailerUploadUrlHandler,
);

/**
 * Store the course trailer key after upload
 * @route PATCH /api/admin/courses/:id/trailer
 */
adminCourseRouter.patch("/courses/:id/trailer", setCourseTrailerHandler);

/**
 * Mint a presigned PUT for a course thumbnail image
 * @route POST /api/admin/courses/:id/thumbnail-url
 */
adminCourseRouter.post(
	"/courses/:id/thumbnail-url",
	validateBody(createThumbnailUploadUrlSchema),
	createCourseThumbnailUploadUrlHandler,
);

/**
 * Store the course thumbnail key after upload
 * @route PATCH /api/admin/courses/:id/thumbnail
 */
adminCourseRouter.patch("/courses/:id/thumbnail", setCourseThumbnailHandler);

export default adminCourseRouter;
export { publicCourseRouter };

//* src/routes/lesson.routes.ts

/**
 * Lesson Routes — public playback + admin lesson CRUD & media.
 * @module routes/lesson
 */

import { Router } from "express";

import {
	createLessonHandler,
	updateLessonHandler,
	deleteLessonHandler,
} from "../controllers/lesson.controller";
import {
	createLessonUploadUrlHandler,
	setLessonVideoHandler,
	getLessonPlaybackUrlHandler,
} from "../controllers/media.controller";

import validateBody from "../middlewares/validate.middleware";
import optionalAuth from "../middlewares/optionalAuth.middleware";

import {
	createLessonSchema,
	updateLessonSchema,
} from "../validators/course.validator";
import { setLessonVideoSchema } from "../validators/media.validator";

/** Public lesson router — mounted at /api/lessons */
const lessonRouter = Router();

/**
 * Mint a playback URL (preview = ungated; paid = enrollment-gated)
 * @route GET /api/lessons/:id/playback-url
 */
lessonRouter.get("/:id/playback-url", optionalAuth, getLessonPlaybackUrlHandler);

/** Admin lesson router — mounted inside adminRouter at /api/admin */
const adminLessonRouter = Router();

/**
 * Create a new lesson
 * @route POST /api/admin/sections/:sectionId/lessons
 */
adminLessonRouter.post(
	"/sections/:sectionId/lessons",
	validateBody(createLessonSchema),
	createLessonHandler,
);

/**
 * Update a lesson
 * @route PATCH /api/admin/lessons/:id
 */
adminLessonRouter.patch(
	"/lessons/:id",
	validateBody(updateLessonSchema),
	updateLessonHandler,
);

/**
 * Delete a lesson
 * @route DELETE /api/admin/lessons/:id
 */
adminLessonRouter.delete("/lessons/:id", deleteLessonHandler);

/**
 * Mint a presigned PUT for a lesson video
 * @route POST /api/admin/lessons/:id/upload-url
 */
adminLessonRouter.post("/lessons/:id/upload-url", createLessonUploadUrlHandler);

/**
 * Store the lesson video key + duration after upload
 * @route PATCH /api/admin/lessons/:id/video
 */
adminLessonRouter.patch(
	"/lessons/:id/video",
	validateBody(setLessonVideoSchema),
	setLessonVideoHandler,
);

export default adminLessonRouter;
export { lessonRouter };

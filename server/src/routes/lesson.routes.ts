//* src/routes/lesson.routes.ts

/**
 * Admin Lesson Routes — lesson CRUD mounted inside adminRouter.
 * @module routes/lesson
 */

import { Router } from "express";

import {
	createLessonHandler,
	updateLessonHandler,
	deleteLessonHandler,
} from "../controllers/lesson.controller";

import validateBody from "../middlewares/validate.middleware";

import {
	createLessonSchema,
	updateLessonSchema,
} from "../validators/course.validator";

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

export default adminLessonRouter;

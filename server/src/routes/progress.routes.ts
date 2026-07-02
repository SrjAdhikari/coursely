//* src/routes/progress.routes.ts

/**
 * Progress Routes — the learner's own lesson progress (report + per-course read).
 * @module routes/progress
 */

import { Router } from "express";

import {
	saveProgressHandler,
	getCourseProgressHandler,
} from "../controllers/progress.controller";

import authenticate from "../middlewares/auth.middleware";
import validateBody, { validateParams } from "../middlewares/validate.middleware";

import {
	lessonIdParamSchema,
	courseIdParamSchema,
	saveProgressSchema,
} from "../validators/progress.validators";

/** Authenticated learner progress router — mounted at /api/progress */
const progressRouter = Router();

/**
 * Report a playhead for a lesson
 * @route PUT /api/progress/:lessonId
 */
progressRouter.put(
	"/:lessonId",
	authenticate,
	validateParams(lessonIdParamSchema),
	validateBody(saveProgressSchema),
	saveProgressHandler,
);

/**
 * The caller's own progress rows for a course
 * @route GET /api/progress/course/:courseId
 */
progressRouter.get(
	"/course/:courseId",
	authenticate,
	validateParams(courseIdParamSchema),
	getCourseProgressHandler,
);

export { progressRouter };

//* src/routes/course.routes.ts

/**
 * Public Catalog Routes
 * @module routes/course
 */

import { Router } from "express";

import {
	listCoursesHandler,
	getCourseBySlugHandler,
} from "../controllers/course.controller";

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

export default courseRouter;

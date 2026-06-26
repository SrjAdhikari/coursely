//* src/routes/section.routes.ts

/**
 * Admin Section Routes — section CRUD mounted inside adminRouter.
 * @module routes/section
 */

import { Router } from "express";

import {
	createSectionHandler,
	updateSectionHandler,
	deleteSectionHandler,
} from "../controllers/section.controller";

import validateBody from "../middlewares/validate.middleware";

import {
	createSectionSchema,
	updateSectionSchema,
} from "../validators/course.validator";

const adminSectionRouter = Router();

/**
 * Create a new section
 * @route POST /api/admin/courses/:courseId/sections
 */
adminSectionRouter.post(
	"/courses/:courseId/sections",
	validateBody(createSectionSchema),
	createSectionHandler,
);

/**
 * Update a section
 * @route PATCH /api/admin/sections/:id
 */
adminSectionRouter.patch(
	"/sections/:id",
	validateBody(updateSectionSchema),
	updateSectionHandler,
);

/**
 * Delete a section
 * @route DELETE /api/admin/sections/:id
 */
adminSectionRouter.delete("/sections/:id", deleteSectionHandler);

export default adminSectionRouter;

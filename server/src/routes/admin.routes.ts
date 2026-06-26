//* src/routes/admin.routes.ts

/**
 * Admin Routes — course/section/lesson CRUD + student management.
 * Every route requires a valid admin session.
 * @module routes/admin
 */

import { Router } from "express";

import authenticate from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/authorize.middleware";
import validateBody from "../middlewares/validate.middleware";

import {
	createCourseHandler,
	updateCourseHandler,
	deleteCourseHandler,
	createSectionHandler,
	updateSectionHandler,
	deleteSectionHandler,
	createLessonHandler,
	updateLessonHandler,
	deleteLessonHandler,
} from "../controllers/admin.controller";
import {
	listStudentsHandler,
	getStudentHandler,
	updateStudentHandler,
} from "../controllers/student.controller";

import {
	createCourseSchema,
	updateCourseSchema,
	createSectionSchema,
	updateSectionSchema,
	createLessonSchema,
	updateLessonSchema,
} from "../validators/course.validator";
import { updateStudentSchema } from "../validators/student.validator";

const adminRouter = Router();

// Gate every admin route: valid session + admin role.
adminRouter.use(authenticate, requireAdmin);

/** --- Courses --- */
/**
 * Create a new course
 * @route POST /api/admin/courses
 */
adminRouter.post(
	"/courses",
	validateBody(createCourseSchema),
	createCourseHandler,
);

/**
 * Update an existing course
 * @route PATCH /api/admin/courses/:id
 */
adminRouter.patch(
	"/courses/:id",
	validateBody(updateCourseSchema),
	updateCourseHandler,
);

/**
 * Delete a course
 * @route DELETE /api/admin/courses/:id
 */
adminRouter.delete("/courses/:id", deleteCourseHandler);

/** --- Sections --- */
/**
 * Create a new section
 * @route POST /api/admin/courses/:courseId/sections
 */
adminRouter.post(
	"/courses/:courseId/sections",
	validateBody(createSectionSchema),
	createSectionHandler,
);

/**
 * Update a section
 * @route PATCH /api/admin/sections/:id
 */
adminRouter.patch(
	"/sections/:id",
	validateBody(updateSectionSchema),
	updateSectionHandler,
);

/**
 * Delete a section
 * @route DELETE /api/admin/sections/:id
 */
adminRouter.delete("/sections/:id", deleteSectionHandler);

/**	--- Lessons --- */
/**
 * Create a new lesson
 * @route POST /api/admin/sections/:sectionId/lessons
 */
adminRouter.post(
	"/sections/:sectionId/lessons",
	validateBody(createLessonSchema),
	createLessonHandler,
);

/**
 * Update a lesson
 * @route PATCH /api/admin/lessons/:id
 */
adminRouter.patch(
	"/lessons/:id",
	validateBody(updateLessonSchema),
	updateLessonHandler,
);

/**
 * Delete a lesson
 * @route DELETE /api/admin/lessons/:id
 */
adminRouter.delete("/lessons/:id", deleteLessonHandler);

/** --- Student management --- */
/**
 * List all students
 * @route GET /api/admin/students
 */
adminRouter.get("/students", listStudentsHandler);

/**
 * Get a student by ID
 * @route GET /api/admin/students/:id
 */
adminRouter.get("/students/:id", getStudentHandler);

/**
 * Update a student
 * @route PATCH /api/admin/students/:id
 */
adminRouter.patch(
	"/students/:id",
	validateBody(updateStudentSchema),
	updateStudentHandler,
);

export default adminRouter;

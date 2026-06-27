//* src/routes/student.routes.ts

/**
 * Admin Student Routes — student management mounted inside adminRouter.
 * @module routes/student
 */

import { Router } from "express";

import {
	listStudentsHandler,
	getStudentHandler,
	updateStudentHandler,
} from "../controllers/student.controller";

import validateBody from "../middlewares/validate.middleware";

import { updateStudentSchema } from "../validators/student.validator";

const adminStudentRouter = Router();

/**
 * List all students
 * @route GET /api/admin/students
 */
adminStudentRouter.get("/students", listStudentsHandler);

/**
 * Get a student by ID
 * @route GET /api/admin/students/:id
 */
adminStudentRouter.get("/students/:id", getStudentHandler);

/**
 * Update a student
 * @route PATCH /api/admin/students/:id
 */
adminStudentRouter.patch(
	"/students/:id",
	validateBody(updateStudentSchema),
	updateStudentHandler,
);

export default adminStudentRouter;

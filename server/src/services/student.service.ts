//* src/services/student.service.ts

import User from "../models/user.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

import type { UpdateStudentInput } from "../validators/student.validator";

const { NOT_FOUND } = httpStatus;
const { STUDENT_NOT_FOUND } = appErrorCode;

// `password` is `select:false`; expose only the admin-table fields.
const STUDENT_FIELDS = "name email role isActive createdAt";

/** Return all students. */
const listStudents = () =>
	User.find({ role: "student" }, STUDENT_FIELDS).sort({ createdAt: -1 }).lean();

/**
 * Get a student by its ID.
 *
 * @param id - The student's ObjectId as a string.
 * @returns The student document, with only the admin-table fields.
 */
const getStudentById = async (id: string) => {
	const student = await User.findById(id, STUDENT_FIELDS).lean();
	if (!student) {
		throw new AppError("Student not found", NOT_FOUND, STUDENT_NOT_FOUND);
	}

	return student;
};

/**
 * Update a student by its ID.
 *
 * @param id - The student's ObjectId as a string.
 * @param input - The update data.
 * @returns The updated student document, with only the admin-table fields.
 */
const updateStudent = async (id: string, input: UpdateStudentInput) => {
	const student = await User.findByIdAndUpdate(id, input, {
		returnDocument: "after",
		runValidators: true,
	})
		.select(STUDENT_FIELDS)
		.lean();

	if (!student) {
		throw new AppError("Student not found", NOT_FOUND, STUDENT_NOT_FOUND);
	}

	return student;
};

export { listStudents, getStudentById, updateStudent };

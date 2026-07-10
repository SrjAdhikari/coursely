//* src/services/student.service.ts

import User from "../models/user.model";
import Enrollment from "../models/enrollment.model";

import getLearningOverview from "./learning.service";
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
 * Get a student by its ID. Scoped to students so the endpoint never resolves admins.
 * @throws {AppError} 404 STUDENT_NOT_FOUND if no student matches the id.
 */
const getStudentById = async (id: string) => {
	const student = await User.findOne(
		{ _id: id, role: "student" },
		STUDENT_FIELDS,
	).lean();
	if (!student) {
		throw new AppError("Student not found", NOT_FOUND, STUDENT_NOT_FOUND);
	}

	return student;
};

/**
 * Update a student by its ID. Scoped to students so admins can't be modified here.
 * @throws {AppError} 404 STUDENT_NOT_FOUND if no student matches the id.
 */
const updateStudent = async (id: string, input: UpdateStudentInput) => {
	const student = await User.findOneAndUpdate(
		{ _id: id, role: "student" },
		input,
		{ returnDocument: "after", runValidators: true },
	)
		.select(STUDENT_FIELDS)
		.lean();

	if (!student) {
		throw new AppError("Student not found", NOT_FOUND, STUDENT_NOT_FOUND);
	}

	return student;
};

// A student's real enrollments (course, amount, purchased, progress) for the
// admin detail view; reuses the overview, which drops deleted-course rows.
const getStudentEnrollments = async (studentId: string) => {
	const [overview, enrollments] = await Promise.all([
		getLearningOverview(studentId),
		Enrollment.find({ userId: studentId })
			.select("courseId amountPaid createdAt")
			.lean(),
	]);

	const enrollmentByCourse = new Map(
		enrollments.map((enrollment) => [
			enrollment.courseId.toString(),
			enrollment,
		]),
	);

	const rows = overview.courses.map((course) => {
		const enrollment = enrollmentByCourse.get(course.courseId);
		return {
			courseId: course.courseId,
			course: course.title,
			purchased: enrollment?.createdAt ?? null,
			amount: enrollment?.amountPaid ?? 0,
			progress: course.percentComplete,
		};
	});

	return rows;
};

export {
	listStudents,
	getStudentById,
	updateStudent,
	getStudentEnrollments,
};

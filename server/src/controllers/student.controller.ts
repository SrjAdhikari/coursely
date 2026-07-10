//* src/controllers/student.controller.ts

import type { RequestHandler } from "express";

import {
	listStudents,
	getStudentById,
	updateStudent,
	getStudentEnrollments,
} from "../services/student.service";

import httpStatus from "../constants/httpStatus";

const { OK } = httpStatus;

const listStudentsHandler: RequestHandler = async (_req, res) => {
	const students = await listStudents();
	res.status(OK).json({
		success: true,
		message: "Students fetched successfully",
		data: students,
	});
};

const getStudentHandler: RequestHandler<{ id: string }> = async (req, res) => {
	const studentId = req.params.id;
	const student = await getStudentById(studentId);
	const enrollments = await getStudentEnrollments(studentId);

	res.status(OK).json({
		success: true,
		message: "Student fetched successfully",
		data: { ...student, enrollments },
	});
};

const updateStudentHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const { role, isActive } = req.body;
	const studentId = req.params.id;

	const student = await updateStudent(studentId, { role, isActive });

	res.status(OK).json({
		success: true,
		message: "Student updated successfully",
		data: student,
	});
};

export { listStudentsHandler, getStudentHandler, updateStudentHandler };

//* src/controllers/course.controller.ts

import type { RequestHandler } from "express";

import {
	listPublishedCourses,
	getCourseBySlug,
	listAllCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse,
} from "../services/course.service";

import httpStatus from "../constants/httpStatus";

const { OK, CREATED } = httpStatus;

/** --- Public handlers --- */
const listCoursesHandler: RequestHandler = async (req, res) => {
	const query = typeof req.query.q === "string" ? req.query.q : undefined;
	const courses = await listPublishedCourses(query);

	res.status(OK).json({
		success: true,
		message: "Courses fetched successfully",
		data: courses,
	});
};

// RequestHandler<{ slug: string }> narrows req.params.slug to a known string property.
const getCourseBySlugHandler: RequestHandler<{ slug: string }> = async (
	req,
	res,
) => {
	const course = await getCourseBySlug(req.params.slug);

	res.status(OK).json({
		success: true,
		message: "Course fetched successfully",
		data: course,
	});
};

/** --- Admin handlers --- */
const listAllCoursesHandler: RequestHandler = async (_req, res) => {
	const courses = await listAllCourses();
	res.status(OK).json({
		success: true,
		message: "Courses fetched successfully",
		data: courses,
	});
};

const getCourseByIdHandler: RequestHandler<{ id: string }> = async (req, res) => {
	const id = req.params.id;
	const course = await getCourseById(id);

	res.status(OK).json({
		success: true,
		message: "Course fetched successfully",
		data: course,
	});
};

const createCourseHandler: RequestHandler = async (req, res) => {
	const {
		title,
		description,
		instructorName,
		thumbnailUrl,
		price,
		currency,
		isPublished,
		category,
		learningOutcomes,
	} = req.body;

	const course = await createCourse({
		title,
		description,
		instructorName,
		thumbnailUrl,
		price,
		currency,
		isPublished,
		category,
		learningOutcomes,
	});

	res.status(CREATED).json({
		success: true,
		message: "Course created successfully",
		data: course,
	});
};

const updateCourseHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const {
		title,
		description,
		instructorName,
		thumbnailUrl,
		price,
		currency,
		isPublished,
		category,
		learningOutcomes,
	} = req.body;

	const course = await updateCourse(req.params.id, {
		title,
		description,
		instructorName,
		thumbnailUrl,
		price,
		currency,
		isPublished,
		category,
		learningOutcomes,
	});

	res.status(OK).json({
		success: true,
		message: "Course updated successfully",
		data: course,
	});
};

const deleteCourseHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const courseId = req.params.id;
	await deleteCourse(courseId);

	res.status(OK).json({
		success: true,
		message: "Course deleted successfully",
	});
};

export {
	listCoursesHandler,
	getCourseBySlugHandler,
	listAllCoursesHandler,
	getCourseByIdHandler,
	createCourseHandler,
	updateCourseHandler,
	deleteCourseHandler,
};

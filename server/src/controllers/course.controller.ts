//* src/controllers/course.controller.ts

import type { RequestHandler } from "express";

import {
	listPublishedCourses,
	getCourseBySlug,
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
const createCourseHandler: RequestHandler = async (req, res) => {
	const {
		title,
		description,
		instructorName,
		thumbnailUrl,
		price,
		currency,
		isPublished,
	} = req.body;

	const course = await createCourse({
		title,
		description,
		instructorName,
		thumbnailUrl,
		price,
		currency,
		isPublished,
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
	} = req.body;

	const course = await updateCourse(req.params.id, {
		title,
		description,
		instructorName,
		thumbnailUrl,
		price,
		currency,
		isPublished,
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
	createCourseHandler,
	updateCourseHandler,
	deleteCourseHandler,
};

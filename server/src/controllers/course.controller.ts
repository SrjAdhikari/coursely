//* src/controllers/course.controller.ts

import type { RequestHandler } from "express";

import {
	listPublishedCourses,
	getCourseBySlug,
} from "../services/course.service";

import httpStatus from "../constants/httpStatus";

const { OK } = httpStatus;

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

export { listCoursesHandler, getCourseBySlugHandler };

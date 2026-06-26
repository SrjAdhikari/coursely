//* src/controllers/admin.controller.ts

import type { RequestHandler } from "express";

import {
	createCourse,
	updateCourse,
	deleteCourse,
} from "../services/course.service";
import {
	createSection,
	updateSection,
	deleteSection,
} from "../services/section.service";
import {
	createLesson,
	updateLesson,
	deleteLesson,
} from "../services/lesson.service";

import httpStatus from "../constants/httpStatus";

const { OK, CREATED } = httpStatus;

/** --- Courses --- */
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

/** --- Sections --- */
const createSectionHandler: RequestHandler<{ courseId: string }> = async (
	req,
	res,
) => {
	const { title, order } = req.body;
	const courseId = req.params.courseId;

	const section = await createSection(courseId, { title, order });

	res.status(CREATED).json({
		success: true,
		message: "Section created successfully",
		data: section,
	});
};

const updateSectionHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const { title, order } = req.body;
	const sectionId = req.params.id;

	const section = await updateSection(sectionId, { title, order });

	res.status(OK).json({
		success: true,
		message: "Section updated successfully",
		data: section,
	});
};

const deleteSectionHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const sectionId = req.params.id;
	await deleteSection(sectionId);

	res.status(OK).json({
		success: true,
		message: "Section deleted successfully",
	});
};

/**	--- Lessons --- */
const createLessonHandler: RequestHandler<{ sectionId: string }> = async (
	req,
	res,
) => {
	const { title, order, isPreview, duration } = req.body;
	const sectionId = req.params.sectionId;

	const lesson = await createLesson(sectionId, {
		title,
		order,
		isPreview,
		duration,
	});

	res.status(CREATED).json({
		success: true,
		message: "Lesson created successfully",
		data: lesson,
	});
};

const updateLessonHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const { title, order, isPreview, duration } = req.body;
	const lessonId = req.params.id;

	const lesson = await updateLesson(lessonId, {
		title,
		order,
		isPreview,
		duration,
	});

	res.status(OK).json({
		success: true,
		message: "Lesson updated successfully",
		data: lesson,
	});
};

const deleteLessonHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const lessonId = req.params.id;
	await deleteLesson(lessonId);

	res.status(OK).json({
		success: true,
		message: "Lesson deleted successfully",
	});
};

export {
	createCourseHandler,
	updateCourseHandler,
	deleteCourseHandler,
	createSectionHandler,
	updateSectionHandler,
	deleteSectionHandler,
	createLessonHandler,
	updateLessonHandler,
	deleteLessonHandler,
};

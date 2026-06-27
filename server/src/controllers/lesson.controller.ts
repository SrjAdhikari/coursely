//* src/controllers/lesson.controller.ts

import type { RequestHandler } from "express";

import {
	createLesson,
	updateLesson,
	deleteLesson,
} from "../services/lesson.service";

import httpStatus from "../constants/httpStatus";

const { OK, CREATED } = httpStatus;

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

export { createLessonHandler, updateLessonHandler, deleteLessonHandler };

//* src/controllers/progress.controller.ts

import type { RequestHandler } from "express";

import { saveProgress, getCourseProgress } from "../services/progress.service";
import httpStatus from "../constants/httpStatus";

const { OK } = httpStatus;

const saveProgressHandler: RequestHandler<{ lessonId: string }> = async (
	req,
	res,
) => {
	const userId = req.user!.id;
	const lessonId = req.params.lessonId;
	const { positionSeconds } = req.body;

	const progress = await saveProgress(userId, lessonId, positionSeconds);

	res.status(OK).json({
		success: true,
		message: "Progress saved successfully",
		data: progress,
	});
};

const getCourseProgressHandler: RequestHandler<{ courseId: string }> = async (
	req,
	res,
) => {
	const userId = req.user!.id;
	const courseId = req.params.courseId;

	const progress = await getCourseProgress(userId, courseId);

	res.status(OK).json({
		success: true,
		message: "Progress fetched successfully",
		data: progress,
	});
};

export { saveProgressHandler, getCourseProgressHandler };

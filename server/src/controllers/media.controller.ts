//* src/controllers/media.controller.ts

import type { RequestHandler } from "express";

import {
	createLessonUploadUrl,
	setLessonVideo,
	getLessonPlaybackUrl,
	createCourseTrailerUploadUrl,
	setCourseTrailer,
	getCourseTrailerUrl,
} from "../services/media.service";

import httpStatus from "../constants/httpStatus";

const { OK } = httpStatus;

const createLessonUploadUrlHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const lessonId = req.params.id;
	const { uploadUrl, videoKey } = await createLessonUploadUrl(lessonId);

	res.status(OK).json({
		success: true,
		message: "Upload URL generated successfully",
		data: { uploadUrl, videoKey },
	});
};

const setLessonVideoHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const { duration } = req.body;
	const lessonId = req.params.id;

	const lesson = await setLessonVideo(lessonId, duration);

	res.status(OK).json({
		success: true,
		message: "Lesson video saved successfully",
		data: lesson,
	});
};

const getLessonPlaybackUrlHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const lessonId = req.params.id;
	const { url } = await getLessonPlaybackUrl(lessonId, req.user);

	res.status(OK).json({
		success: true,
		message: "Playback URL generated successfully",
		data: { url },
	});
};

const createCourseTrailerUploadUrlHandler: RequestHandler<{ id: string }> =
	async (req, res) => {
		const courseId = req.params.id;
		const { uploadUrl, trailerKey } =
			await createCourseTrailerUploadUrl(courseId);

		res.status(OK).json({
			success: true,
			message: "Trailer upload URL generated successfully",
			data: { uploadUrl, trailerKey },
		});
	};

const setCourseTrailerHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const courseId = req.params.id;
	const course = await setCourseTrailer(courseId);

	res.status(OK).json({
		success: true,
		message: "Course trailer saved successfully",
		data: course,
	});
};

const getCourseTrailerUrlHandler: RequestHandler<{ slug: string }> = async (
	req,
	res,
) => {
	const slug = req.params.slug;
	const { url } = await getCourseTrailerUrl(slug);

	res.status(OK).json({
		success: true,
		message: "Trailer URL generated successfully",
		data: { url },
	});
};

export {
	createLessonUploadUrlHandler,
	setLessonVideoHandler,
	getLessonPlaybackUrlHandler,
	createCourseTrailerUploadUrlHandler,
	setCourseTrailerHandler,
	getCourseTrailerUrlHandler,
};

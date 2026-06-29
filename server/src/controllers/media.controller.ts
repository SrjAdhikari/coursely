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

/** @route POST /api/admin/lessons/:id/upload-url */
const createLessonUploadUrlHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const { uploadUrl, videoKey } = await createLessonUploadUrl(req.params.id);
	res.status(OK).json({
		success: true,
		message: "Upload URL generated successfully",
		data: { uploadUrl, videoKey },
	});
};

/** @route PATCH /api/admin/lessons/:id/video */
const setLessonVideoHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const { duration } = req.body;
	const lesson = await setLessonVideo(req.params.id, duration);
	res.status(OK).json({
		success: true,
		message: "Lesson video saved successfully",
		data: lesson,
	});
};

/** @route GET /api/lessons/:id/playback-url */
const getLessonPlaybackUrlHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const { url } = await getLessonPlaybackUrl(req.params.id, req.user);
	res.status(OK).json({
		success: true,
		message: "Playback URL generated successfully",
		data: { url },
	});
};

/** @route POST /api/admin/courses/:id/trailer-url */
const createCourseTrailerUploadUrlHandler: RequestHandler<{ id: string }> =
	async (req, res) => {
		const { uploadUrl, trailerKey } = await createCourseTrailerUploadUrl(
			req.params.id,
		);
		res.status(OK).json({
			success: true,
			message: "Trailer upload URL generated successfully",
			data: { uploadUrl, trailerKey },
		});
	};

/** @route PATCH /api/admin/courses/:id/trailer */
const setCourseTrailerHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const course = await setCourseTrailer(req.params.id);
	res.status(OK).json({
		success: true,
		message: "Course trailer saved successfully",
		data: course,
	});
};

/** @route GET /api/courses/:slug/trailer-url */
const getCourseTrailerUrlHandler: RequestHandler<{ slug: string }> = async (
	req,
	res,
) => {
	const { url } = await getCourseTrailerUrl(req.params.slug);
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

//* src/services/media.service.ts

import Course from "../models/course.model";
import Lesson from "../models/lesson.model";

import { isEnrolled } from "./enrollment.service";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

import {
	lessonVideoKey,
	courseTrailerKey,
	presignPut,
	presignGet,
} from "../lib/r2";

const { NOT_FOUND, UNAUTHORIZED, FORBIDDEN } = httpStatus;
const {
	LESSON_NOT_FOUND,
	COURSE_NOT_FOUND,
	VIDEO_NOT_FOUND,
	TRAILER_NOT_FOUND,
	UNAUTHORIZED_ACCESS,
	NOT_ENROLLED,
} = appErrorCode;

/**
 * Admin: mint a presigned PUT for a lesson's video.
 * @throws {AppError} 404 LESSON_NOT_FOUND if the lesson does not exist.
 * @returns The upload URL and the canonical (server-derived) video key.
 */
const createLessonUploadUrl = async (lessonId: string) => {
	const lesson = await Lesson.findById(lessonId);
	if (!lesson) {
		throw new AppError("Lesson not found", NOT_FOUND, LESSON_NOT_FOUND);
	}

	const videoKey = lessonVideoKey(lessonId);
	const uploadUrl = await presignPut(videoKey);
	return { uploadUrl, videoKey };
};

/**
 * Admin: confirm a lesson video upload — store the canonical key + duration.
 * The key is server-derived (never client-supplied).
 * @throws {AppError} 404 LESSON_NOT_FOUND if the lesson does not exist.
 */
const setLessonVideo = async (lessonId: string, duration: number) => {
	const lesson = await Lesson.findByIdAndUpdate(
		lessonId,
		{ videoKey: lessonVideoKey(lessonId), duration },
		{ returnDocument: "after", runValidators: true },
	);
	if (!lesson) {
		throw new AppError("Lesson not found", NOT_FOUND, LESSON_NOT_FOUND);
	}
	return lesson;
};

/**
 * Admin: mint a presigned PUT for a course's trailer.
 * @throws {AppError} 404 COURSE_NOT_FOUND if the course does not exist.
 * @returns The upload URL and the canonical (server-derived) trailer key.
 */
const createCourseTrailerUploadUrl = async (courseId: string) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}

	const trailerKey = courseTrailerKey(courseId);
	const uploadUrl = await presignPut(trailerKey);
	return { uploadUrl, trailerKey };
};

/**
 * Admin: confirm a course trailer upload — store the canonical key.
 * @throws {AppError} 404 COURSE_NOT_FOUND if the course does not exist.
 */
const setCourseTrailer = async (courseId: string) => {
	const course = await Course.findByIdAndUpdate(
		courseId,
		{ trailerKey: courseTrailerKey(courseId) },
		{ returnDocument: "after", runValidators: true },
	);
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}
	return course;
};

/**
 * Mint a ~1h playback URL for a lesson's video.
 * Preview lessons are ungated; paid lessons require an authenticated, enrolled user.
 * @throws {AppError} 404 LESSON_NOT_FOUND / 404 VIDEO_NOT_FOUND / 401 UNAUTHORIZED_ACCESS / 403 NOT_ENROLLED
 */
const getLessonPlaybackUrl = async (lessonId: string, userId?: string) => {
	const lesson = await Lesson.findById(lessonId).lean();
	if (!lesson) {
		throw new AppError("Lesson not found", NOT_FOUND, LESSON_NOT_FOUND);
	}
	if (!lesson.videoKey) {
		throw new AppError(
			"This lesson has no video yet",
			NOT_FOUND,
			VIDEO_NOT_FOUND,
		);
	}

	if (!lesson.isPreview) {
		if (!userId) {
			throw new AppError(
				"Authentication required",
				UNAUTHORIZED,
				UNAUTHORIZED_ACCESS,
			);
		}
		const enrolled = await isEnrolled(userId, lesson.courseId.toString());
		if (!enrolled) {
			throw new AppError(
				"You are not enrolled in this course",
				FORBIDDEN,
				NOT_ENROLLED,
			);
		}
	}

	const url = await presignGet(lesson.videoKey);
	return { url };
};

/**
 * Public: mint an ungated ~1h playback URL for a published course's trailer.
 * @throws {AppError} 404 COURSE_NOT_FOUND / 404 TRAILER_NOT_FOUND
 */
const getCourseTrailerUrl = async (slug: string) => {
	const course = await Course.findOne({ slug, isPublished: true }).lean();
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}
	if (!course.trailerKey) {
		throw new AppError(
			"This course has no trailer",
			NOT_FOUND,
			TRAILER_NOT_FOUND,
		);
	}

	const url = await presignGet(course.trailerKey);
	return { url };
};

export {
	createLessonUploadUrl,
	setLessonVideo,
	createCourseTrailerUploadUrl,
	setCourseTrailer,
	getLessonPlaybackUrl,
	getCourseTrailerUrl,
};

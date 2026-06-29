//* src/services/media.service.ts

import Course from "../models/course.model";
import Lesson from "../models/lesson.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

import { lessonVideoKey, courseTrailerKey, presignPut } from "../lib/r2";

const { NOT_FOUND } = httpStatus;
const { LESSON_NOT_FOUND, COURSE_NOT_FOUND } = appErrorCode;

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

export {
	createLessonUploadUrl,
	setLessonVideo,
	createCourseTrailerUploadUrl,
	setCourseTrailer,
};

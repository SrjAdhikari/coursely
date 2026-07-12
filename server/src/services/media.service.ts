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
	courseThumbnailKey,
	presignPut,
	presignGet,
	objectExists,
} from "../lib/r2";

import type { PublicUser } from "../models/user.model";

const { NOT_FOUND, UNAUTHORIZED, FORBIDDEN, BAD_REQUEST } = httpStatus;
const {
	LESSON_NOT_FOUND,
	COURSE_NOT_FOUND,
	VIDEO_NOT_FOUND,
	TRAILER_NOT_FOUND,
	UNAUTHORIZED_ACCESS,
	NOT_ENROLLED,
	UPLOAD_INCOMPLETE,
} = appErrorCode;

/**
 * Admin: mint a presigned PUT for a lesson's video.
 *
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
 * Admin: confirm a lesson video upload — verify the object exists in R2, then
 * store the canonical key + duration. The key is server-derived (never client-supplied).
 *
 * @throws {AppError} 404 LESSON_NOT_FOUND / 400 UPLOAD_INCOMPLETE
 */
const setLessonVideo = async (lessonId: string, duration: number) => {
	const lesson = await Lesson.findById(lessonId);
	if (!lesson) {
		throw new AppError("Lesson not found", NOT_FOUND, LESSON_NOT_FOUND);
	}

	const videoKey = lessonVideoKey(lessonId);
	if (!(await objectExists(videoKey))) {
		throw new AppError(
			"Video upload not found in storage",
			BAD_REQUEST,
			UPLOAD_INCOMPLETE,
		);
	}

	lesson.videoKey = videoKey;
	lesson.duration = duration;
	await lesson.save();

	return lesson;
};

/**
 * Admin: mint a presigned PUT for a course's trailer.
 *
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
 * Admin: confirm a course trailer upload — verify the object exists in R2,
 * then store the canonical key.
 *
 * @throws {AppError} 404 COURSE_NOT_FOUND / 400 UPLOAD_INCOMPLETE
 */
const setCourseTrailer = async (courseId: string) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}

	const trailerKey = courseTrailerKey(courseId);
	if (!(await objectExists(trailerKey))) {
		throw new AppError(
			"Trailer upload not found in storage",
			BAD_REQUEST,
			UPLOAD_INCOMPLETE,
		);
	}

	course.trailerKey = trailerKey;
	await course.save();

	return course;
};

/**
 * Admin: mint a presigned PUT for a course's thumbnail image. The image type is
 * pinned by the given Content-Type; the key is server-derived (extension-less).
 *
 * @throws {AppError} 404 COURSE_NOT_FOUND if the course does not exist.
 * @returns The upload URL and the canonical (server-derived) thumbnail key.
 */
const createCourseThumbnailUploadUrl = async (
	courseId: string,
	contentType: string,
) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}

	const thumbnailKey = courseThumbnailKey(courseId);
	const uploadUrl = await presignPut(thumbnailKey, contentType);

	return { uploadUrl, thumbnailKey };
};

/**
 * Admin: confirm a course thumbnail upload — verify the object exists in R2,
 * then store the canonical key.
 *
 * @throws {AppError} 404 COURSE_NOT_FOUND / 400 UPLOAD_INCOMPLETE
 */
const setCourseThumbnail = async (courseId: string) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}

	const thumbnailKey = courseThumbnailKey(courseId);
	if (!(await objectExists(thumbnailKey))) {
		throw new AppError(
			"Thumbnail upload not found in storage",
			BAD_REQUEST,
			UPLOAD_INCOMPLETE,
		);
	}

	course.thumbnailKey = thumbnailKey;
	await course.save();

	return course;
};

/**
 * Mint a ~1h playback URL for a lesson's video.
 * Draft (unpublished) courses are not public — only an admin may play their
 * lessons (for pre-publish authoring). For a published course: preview lessons
 * are ungated; paid lessons require an authenticated, enrolled user.
 *
 * @throws {AppError} 404 LESSON_NOT_FOUND / 404 VIDEO_NOT_FOUND / 401 UNAUTHORIZED_ACCESS / 403 NOT_ENROLLED
 */
const getLessonPlaybackUrl = async (lessonId: string, user?: PublicUser) => {
	const lesson = await Lesson.findById(lessonId).lean();
	if (!lesson) {
		throw new AppError("Lesson not found", NOT_FOUND, LESSON_NOT_FOUND);
	}

	// Admins bypass publish/enrollment gating (verify uploads before publishing).
	if (user?.role !== "admin") {
		// A draft course is not public surface — hide its lessons from non-admins
		// entirely (404, no existence leak), matching the trailer's published-only rule.
		const course = await Course.findById(lesson.courseId)
			.select("isPublished")
			.lean();
		if (!course || !course.isPublished) {
			throw new AppError("Lesson not found", NOT_FOUND, LESSON_NOT_FOUND);
		}

		// Paid lessons require an authenticated, enrolled user; preview is ungated.
		if (!lesson.isPreview) {
			if (!user) {
				throw new AppError(
					"Authentication required",
					UNAUTHORIZED,
					UNAUTHORIZED_ACCESS,
				);
			}

			const enrolled = await isEnrolled(user.id, lesson.courseId.toString());
			if (!enrolled) {
				throw new AppError(
					"You are not enrolled in this course",
					FORBIDDEN,
					NOT_ENROLLED,
				);
			}
		}
	}

	// Checked AFTER the gate so unauthorized callers can't probe video existence.
	if (!lesson.videoKey) {
		throw new AppError(
			"This lesson has no video yet",
			NOT_FOUND,
			VIDEO_NOT_FOUND,
		);
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
	createCourseThumbnailUploadUrl,
	setCourseThumbnail,
	getLessonPlaybackUrl,
	getCourseTrailerUrl,
};

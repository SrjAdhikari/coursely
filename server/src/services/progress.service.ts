//* src/services/progress.service.ts

import Lesson from "../models/lesson.model";
import Progress from "../models/progress.model";

import { isEnrolled } from "./enrollment.service";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { NOT_FOUND, FORBIDDEN } = httpStatus;
const { LESSON_NOT_FOUND, NOT_ENROLLED } = appErrorCode;

// Lessons mark complete server-side at 95% watched; the client reports position only.
const COMPLETION_THRESHOLD = 0.95;

/**
 * Report a playhead for a lesson: resolve the lesson (→ courseId + duration),
 * assert enrollment, derive sticky ≥95% completion, then upsert on
 * {userId,lessonId}. `courseId` is stamped from the lesson on insert (drift-proof).
 *
 * @throws {AppError} 404 LESSON_NOT_FOUND / 403 NOT_ENROLLED
 * @returns The updated progress row.
 */
const saveProgress = async (
	userId: string,
	lessonId: string,
	positionSeconds: number,
) => {
	const lesson = await Lesson.findById(lessonId)
		.select("courseId duration")
		.lean();
	if (!lesson) {
		throw new AppError("Lesson not found", NOT_FOUND, LESSON_NOT_FOUND);
	}

	const courseId = lesson.courseId.toString();
	const enrolled = await isEnrolled(userId, courseId);
	if (!enrolled) {
		throw new AppError(
			"You are not enrolled in this course",
			FORBIDDEN,
			NOT_ENROLLED,
		);
	}

	const existing = await Progress.findOne({ userId, lessonId });

	const completedNow =
		lesson.duration > 0 &&
		positionSeconds / lesson.duration >= COMPLETION_THRESHOLD;
	const wasCompleted = existing?.completed ?? false;

	// Sticky: once complete, never flips back (rewinding does not un-complete).
	const completed = wasCompleted || completedNow;

	const update: {
		positionSeconds: number;
		completed: boolean;
		completedAt?: Date;
	} = { positionSeconds, completed };

	// Stamp completedAt only on the first false→true transition.
	if (completed && !wasCompleted) {
		update.completedAt = new Date();
	}

	const progress = await Progress.findOneAndUpdate(
		{ userId, lessonId },
		{ $set: update, $setOnInsert: { courseId } },
		{
			upsert: true,
			returnDocument: "after",
			setDefaultsOnInsert: true,
			runValidators: true,
		},
	).lean();

	return progress;
};

/**
 * The caller's own progress rows for a course — strictly {userId,courseId}-scoped
 * (IDOR-safe: no client-supplied user id) and enrollment-gated.
 *
 * @throws {AppError} 403 NOT_ENROLLED
 * @returns Rows of `{ lessonId, positionSeconds, completed }`.
 */
const getCourseProgress = async (userId: string, courseId: string) => {
	const enrolled = await isEnrolled(userId, courseId);
	if (!enrolled) {
		throw new AppError(
			"You are not enrolled in this course",
			FORBIDDEN,
			NOT_ENROLLED,
		);
	}

	const progress = await Progress.find({ userId, courseId })
		.select("lessonId positionSeconds completed -_id")
		.lean();

	return progress;
};

export { saveProgress, getCourseProgress };

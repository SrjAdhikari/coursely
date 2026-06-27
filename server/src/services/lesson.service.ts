//* src/services/lesson.service.ts

import Section from "../models/section.model";
import Lesson from "../models/lesson.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

import type {
	CreateLessonInput,
	UpdateLessonInput,
} from "../validators/course.validator";

const { NOT_FOUND } = httpStatus;
const { SECTION_NOT_FOUND, LESSON_NOT_FOUND } = appErrorCode;

/**
 * Create a lesson under an existing section.
 * @throws {AppError} 404 SECTION_NOT_FOUND if the section does not exist.
 */
const createLesson = async (sectionId: string, input: CreateLessonInput) => {
	const section = await Section.findById(sectionId);
	if (!section) {
		throw new AppError("Section not found", NOT_FOUND, SECTION_NOT_FOUND);
	}

	// Denormalize courseId from the parent section — set once, never updated.
	return Lesson.create({ ...input, sectionId, courseId: section.courseId });
};

/**
 * Update a lesson by its id.
 * @throws {AppError} 404 LESSON_NOT_FOUND if the lesson does not exist.
 */
const updateLesson = async (id: string, input: UpdateLessonInput) => {
	const lesson = await Lesson.findByIdAndUpdate(id, input, {
		returnDocument: "after",
		runValidators: true,
	});

	if (!lesson) {
		throw new AppError("Lesson not found", NOT_FOUND, LESSON_NOT_FOUND);
	}

	return lesson;
};

/**
 * Hard-delete a lesson. Leaf node — no children to cascade, no transaction needed.
 * @throws {AppError} 404 LESSON_NOT_FOUND if the lesson does not exist.
 */
const deleteLesson = async (id: string): Promise<void> => {
	const lesson = await Lesson.findByIdAndDelete(id);
	if (!lesson) {
		throw new AppError("Lesson not found", NOT_FOUND, LESSON_NOT_FOUND);
	}
};

export { createLesson, updateLesson, deleteLesson };

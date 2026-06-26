//* src/services/section.service.ts

import mongoose from "mongoose";

import Course from "../models/course.model";
import Section from "../models/section.model";
import Lesson from "../models/lesson.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";
import type {
	CreateSectionInput,
	UpdateSectionInput,
} from "../validators/course.validator";

const { NOT_FOUND } = httpStatus;
const { COURSE_NOT_FOUND, SECTION_NOT_FOUND } = appErrorCode;

/**
 * Create a section under an existing course.
 * @throws {AppError} 404 COURSE_NOT_FOUND if the course does not exist.
 */
const createSection = async (courseId: string, input: CreateSectionInput) => {
	const exists = await Course.exists({ _id: courseId });
	if (!exists) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}
	return Section.create({ courseId, ...input });
};

/**
 * Update a section by id.
 * @throws {AppError} 404 SECTION_NOT_FOUND if the section does not exist.
 */
const updateSection = async (id: string, input: UpdateSectionInput) => {
	const section = await Section.findByIdAndUpdate(id, input, {
		returnDocument: "after",
		runValidators: true,
	});
	if (!section) {
		throw new AppError("Section not found", NOT_FOUND, SECTION_NOT_FOUND);
	}
	return section;
};

/**
 * Hard-delete a section and cascade its lessons atomically.
 * @throws {AppError} 404 SECTION_NOT_FOUND if the section does not exist.
 */
const deleteSection = async (id: string): Promise<void> => {
	const section = await Section.findById(id);
	if (!section) {
		throw new AppError("Section not found", NOT_FOUND, SECTION_NOT_FOUND);
	}

	// Cascade atomically — mirror deleteCourse: delete the child lessons then the
	// section inside one transaction so a mid-cascade failure can't orphan lessons.
	const session = await mongoose.startSession();
	try {
		await session.withTransaction(async () => {
			await Lesson.deleteMany({ sectionId: section._id }, { session });
			await Section.deleteOne({ _id: section._id }, { session });
		});
	} finally {
		await session.endSession();
	}
};

export { createSection, updateSection, deleteSection };

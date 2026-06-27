//* src/services/course.service.ts

import mongoose from "mongoose";

import Course, { type CourseDocument } from "../models/course.model";
import Section, { type SectionDocument } from "../models/section.model";
import Lesson, { type LessonDocument } from "../models/lesson.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";
import { slugify } from "../utils/slug";
import type {
	CreateCourseInput,
	UpdateCourseInput,
} from "../validators/course.validator";

const { NOT_FOUND, CONFLICT } = httpStatus;
const { COURSE_NOT_FOUND, COURSE_HAS_ENROLLMENTS } = appErrorCode;

/** Public list cards never expose trailerKey/videoKey. */
const LIST_FIELDS = {
	title: 1,
	slug: 1,
	description: 1,
	instructorName: 1,
	thumbnailUrl: 1,
	price: 1,
	currency: 1,
	isPublished: 1,
	createdAt: 1,
} as const;

export interface CourseDetail extends Omit<CourseDocument, "trailerKey"> {
	sections: (SectionDocument & {
		lessons: Omit<LessonDocument, "videoKey">[];
	})[];
}

interface CourseDetailFull extends CourseDocument {
	sections: (SectionDocument & { lessons: LessonDocument[] })[];
}

/**
 * List all published courses, optionally filtered by a search query.
 *
 * @param q - Optional search query.
 * @returns An array of published courses matching the query.
 */
const listPublishedCourses = async (q?: string) => {
	// Whitespace-only query = no search: an empty $text match returns nothing, so trim first.
	const search = q?.trim();
	if (search) {
		return Course.find(
			{ isPublished: true, $text: { $search: search } },
			LIST_FIELDS,
		)
			.sort({ score: { $meta: "textScore" } })
			.lean();
	}

	return Course.find({ isPublished: true }, LIST_FIELDS)
		.sort({ createdAt: -1 })
		.lean();
};

/**
 * Get a published course by slug, with its sections and lessons (no videoKey).
 * @throws {AppError} 404 COURSE_NOT_FOUND if the course does not exist.
 */
const getCourseBySlug = async (slug: string): Promise<CourseDetail> => {
	const course = await Course.findOne(
		{ slug, isPublished: true },
		{ trailerKey: 0 },
	).lean();

	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}

	const [sections, lessons] = await Promise.all([
		Section.find({ courseId: course._id }).sort({ order: 1 }).lean(),
		Lesson.find({ courseId: course._id }, { videoKey: 0 })
			.sort({ order: 1 })
			.lean(),
	]);

	const lessonsBySection = new Map<
		string,
		Omit<LessonDocument, "videoKey">[]
	>();
	for (const lesson of lessons) {
		const key = lesson.sectionId.toString();
		const bucket = lessonsBySection.get(key) ?? [];
		bucket.push(lesson);
		lessonsBySection.set(key, bucket);
	}

	return {
		...course,
		sections: sections.map((section) => ({
			...section,
			lessons: lessonsBySection.get(section._id.toString()) ?? [],
		})),
	} as CourseDetail;
};

/**
 * Generates a unique slug from a title, appending -2, -3, … until it is unique.
 *
 * @param title - The title to generate a slug from.
 * @returns A unique slug.
 */
const generateUniqueSlug = async (title: string): Promise<string> => {
	const base = slugify(title);
	let slug = base;
	let suffix = 2;
	while (await Course.exists({ slug })) {
		slug = `${base}-${suffix}`;
		suffix += 1;
	}
	return slug;
};

/**
 * Create a course with a unique slug generated from the title.
 * @returns The created course document.
 */
const createCourse = async (input: CreateCourseInput) => {
	const slug = await generateUniqueSlug(input.title);
	return Course.create({ ...input, slug });
};

/**
 * Update a course by id. Never writes `slug` (the update input has no slug field).
 * @throws {AppError} 404 COURSE_NOT_FOUND if the course does not exist.
 */
const updateCourse = async (id: string, input: UpdateCourseInput) => {
	const course = await Course.findByIdAndUpdate(id, input, {
		returnDocument: "after",
		runValidators: true,
	});
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}
	return course;
};

/**
 * Hard-delete a course and cascade its sections + lessons. Blocked (409) while
 * any enrollment references the course (unpublish instead) so the payment audit
 * trail is never destroyed.
 *
 * @throws {AppError} 404 COURSE_NOT_FOUND if the course does not exist.
 * @throws {AppError} 409 COURSE_HAS_ENROLLMENTS if any enrollment references it.
 */
const deleteCourse = async (id: string): Promise<void> => {
	const course = await Course.findById(id);
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}

	// Raw-collection count (Enrollment model lands Phase 4/5). Not race-proof — the
	// Phase-5 enrollment writer must coordinate; unreachable today (no writer yet).
	const enrollments = await mongoose.connection
		.collection("enrollments")
		.countDocuments({ courseId: course._id });
	if (enrollments > 0) {
		throw new AppError(
			"Cannot delete a course with enrollments; unpublish it instead",
			CONFLICT,
			COURSE_HAS_ENROLLMENTS,
		);
	}

	// Cascade in one transaction — children then parent, so a mid-cascade failure
	// can't orphan rows. (R2 objects + progress cleaned up in Phase 4+.)
	const session = await mongoose.startSession();
	try {
		await session.withTransaction(async () => {
			await Lesson.deleteMany({ courseId: course._id }, { session });
			await Section.deleteMany({ courseId: course._id }, { session });
			await Course.deleteOne({ _id: course._id }, { session });
		});
	} finally {
		await session.endSession();
	}
};

/** Admin: all courses (published + drafts), newest first. */
const listAllCourses = () => Course.find().sort({ createdAt: -1 }).lean();

/**
 * Get a course by id, with its sections and lessons (videoKey included).
 *
 * @param id - The ID of the course to fetch.
 * @throws {AppError} 404 COURSE_NOT_FOUND if the course does not exist.
 * @returns A promise resolving to the course with its sections and lessons.
 */
const getCourseById = async (id: string): Promise<CourseDetailFull> => {
	const course = await Course.findById(id).lean();
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}

	const [sections, lessons] = await Promise.all([
		Section.find({ courseId: course._id }).sort({ order: 1 }).lean(),
		Lesson.find({ courseId: course._id }).sort({ order: 1 }).lean(),
	]);

	const lessonsBySection = new Map<string, LessonDocument[]>();
	for (const lesson of lessons) {
		const key = lesson.sectionId.toString();
		const bucket = lessonsBySection.get(key) ?? [];
		bucket.push(lesson);
		lessonsBySection.set(key, bucket);
	}

	return {
		...course,
		sections: sections.map((section) => ({
			...section,
			lessons: lessonsBySection.get(section._id.toString()) ?? [],
		})),
	} as CourseDetailFull;
};

export {
	listPublishedCourses,
	getCourseBySlug,
	createCourse,
	updateCourse,
	deleteCourse,
	listAllCourses,
	getCourseById,
};

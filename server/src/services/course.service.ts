//* src/services/course.service.ts

import Course, { type CourseDocument } from "../models/course.model";
import Section, { type SectionDocument } from "../models/section.model";
import Lesson, { type LessonDocument } from "../models/lesson.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { NOT_FOUND } = httpStatus;
const { COURSE_NOT_FOUND } = appErrorCode;

// Public list cards never expose trailerKey/videoKey.
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

/** Published courses, newest first; with `q`, full-text search ranked by relevance. */
const listPublishedCourses = async (q?: string) => {
	if (q) {
		return Course.find(
			{ isPublished: true, $text: { $search: q } },
			LIST_FIELDS,
		)
			.sort({ score: { $meta: "textScore" } })
			.lean();
	}

	return Course.find({ isPublished: true }, LIST_FIELDS)
		.sort({ createdAt: -1 })
		.lean();
};

/** A published course + its ordered sections/lessons; never returns video keys. */
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

export { listPublishedCourses, getCourseBySlug };

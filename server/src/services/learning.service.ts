//* src/services/learning.service.ts

import { Types } from "mongoose";

import Enrollment from "../models/enrollment.model";
import Section from "../models/section.model";
import Lesson from "../models/lesson.model";
import Progress from "../models/progress.model";

import resolveThumbnailUrl from "../lib/thumbnail";

// How many recent lessons the overview surfaces.
const RECENT_LIMIT = 4;

type LessonLean = {
	_id: Types.ObjectId;
	courseId: Types.ObjectId;
	sectionId: Types.ObjectId;
	order: number;
	title: string;
};
type CourseLean = {
	_id: Types.ObjectId;
	title: string;
	slug: string;
	thumbnailUrl?: string;
	thumbnailKey?: string;
	instructorName: string;
};

/**
 * The caller's aggregated learning overview: stats, per-enrolled-course progress
 * (with the resume lesson — the most-recently-watched incomplete lesson, else the
 * first in curriculum order), and recently-watched lessons. All server-derived and
 * strictly scoped to `userId` (no client ids).
 */
const getLearningOverview = async (userId: string) => {
	const enrollments = await Enrollment.find({ userId })
		.sort({ createdAt: -1 })
		.populate<{
			courseId: CourseLean;
		}>("courseId", "title slug thumbnailUrl thumbnailKey instructorName")
		.lean();

	// Drop enrollments whose course was deleted (populate → null).
	const courses = enrollments
		.map((enrollment) => enrollment.courseId)
		.filter((course): course is CourseLean => Boolean(course));
	const courseIds = courses.map((course) => course._id);

	if (courseIds.length === 0) {
		return {
			stats: {
				enrolled: 0,
				inProgress: 0,
				completed: 0,
				lessonsCompleted: 0,
				totalLessons: 0,
				overallPercent: 0,
			},
			courses: [],
			recentLessons: [],
		};
	}

	// Resolve each enrolled course's thumbnail once (signs an uploaded key, else
	// keeps the raw URL) so cards + recent-lesson tiles serve a viewable URL.
	const thumbnailUrlByCourse = new Map(
		await Promise.all(
			courses.map(
				async (course) =>
					[course._id.toString(), await resolveThumbnailUrl(course)] as const,
			),
		),
	);

	// Fetch all sections, lessons, and progress rows for the enrolled courses in parallel.
	const [sections, lessons, progressRows] = await Promise.all([
		Section.find({ courseId: { $in: courseIds } })
			.select("_id order title")
			.lean(),
		Lesson.find({ courseId: { $in: courseIds } })
			.select("_id courseId sectionId order title")
			.lean(),
		Progress.find({ userId, courseId: { $in: courseIds } })
			.select("lessonId courseId completed updatedAt")
			.lean(),
	]);

	// Index section order + title by sectionId for ordering and the next-lesson label.
	const sectionOrder = new Map(
		sections.map((section) => [section._id.toString(), section.order]),
	);
	const sectionTitleById = new Map(
		sections.map((section) => [section._id.toString(), section.title]),
	);

	// Index completed lessons by lessonId for quick lookup.
	const completedLessonIds = new Set(
		progressRows
			.filter((row) => row.completed)
			.map((row) => row.lessonId.toString()),
	);

	// Index last activity by course, and each lesson's last-progress timestamp
	// (used to pick the resume lesson — where the student actually left off).
	const lastActivityByCourse = new Map<string, Date>();
	const progressUpdatedByLesson = new Map<string, Date>();

	for (const row of progressRows) {
		progressUpdatedByLesson.set(row.lessonId.toString(), row.updatedAt);
		const key = row.courseId.toString();
		const current = lastActivityByCourse.get(key);
		if (!current || row.updatedAt > current)
			lastActivityByCourse.set(key, row.updatedAt);
	}

	// Index lessons by course for curriculum-order sorting of lessons.
	const lessonsByCourse = new Map<string, LessonLean[]>();
	for (const lesson of lessons as LessonLean[]) {
		const key = lesson.courseId.toString();
		const bucket = lessonsByCourse.get(key);
		if (bucket) bucket.push(lesson);
		else lessonsByCourse.set(key, [lesson]);
	}

	// Sort lessons in curriculum order.
	const orderLessons = (list: LessonLean[]) =>
		[...list].sort((first, second) => {
			const firstSection = sectionOrder.get(first.sectionId.toString()) ?? 0;
			const secondSection = sectionOrder.get(second.sectionId.toString()) ?? 0;
			if (firstSection !== secondSection) return firstSection - secondSection;
			return first.order - second.order;
		});

	// Build course rows with progress stats and next incomplete lesson.
	const courseRows = courses.map((course) => {
		const courseId = course._id.toString();
		const ordered = orderLessons(lessonsByCourse.get(courseId) ?? []);
		const totalLessons = ordered.length;

		const completedLessons = ordered.filter((lesson) =>
			completedLessonIds.has(lesson._id.toString()),
		).length;

		const percentComplete =
			totalLessons > 0
				? Math.round((completedLessons / totalLessons) * 100)
				: 0;

		// Resume target = the most-recently-watched incomplete lesson (where the
		// student left off); fall back to the first incomplete lesson in
		// curriculum order when nothing mid-course has been started yet.
		const incompleteLessons = ordered.filter(
			(lesson) => !completedLessonIds.has(lesson._id.toString()),
		);

		let resumeLesson: LessonLean | undefined;
		let resumeUpdatedAt: Date | undefined;
		for (const lesson of incompleteLessons) {
			const updatedAt = progressUpdatedByLesson.get(lesson._id.toString());
			if (updatedAt && (!resumeUpdatedAt || updatedAt > resumeUpdatedAt)) {
				resumeUpdatedAt = updatedAt;
				resumeLesson = lesson;
			}
		}

		const nextIncomplete = resumeLesson ?? incompleteLessons[0];
		const nextIncompleteIndex = nextIncomplete
			? ordered.findIndex(
					(lesson) => lesson._id.toString() === nextIncomplete._id.toString(),
				)
			: -1;

		const lastActivityAt = lastActivityByCourse.get(courseId) ?? null;
		const state =
			totalLessons > 0 && completedLessons === totalLessons
				? "completed"
				: lastActivityAt !== null
					? "in_progress"
					: "not_started";

		return {
			courseId,
			title: course.title,
			slug: course.slug,
			thumbnailUrl: thumbnailUrlByCourse.get(courseId) ?? "",
			instructorName: course.instructorName,
			totalLessons,
			completedLessons,
			percentComplete,
			state,
			lastActivityAt,
			nextLesson: nextIncomplete
				? {
						lessonId: nextIncomplete._id.toString(),
						title: nextIncomplete.title,
						lessonNumber: nextIncompleteIndex + 1,
						sectionTitle:
							sectionTitleById.get(nextIncomplete.sectionId.toString()) ?? "",
					}
				: null,
		};
	});

	const lessonById = new Map(
		(lessons as LessonLean[]).map((lesson) => [lesson._id.toString(), lesson]),
	);

	const courseById = new Map(
		courses.map((course) => [course._id.toString(), course]),
	);

	// The student's progress rows, newest-first and capped at RECENT_LIMIT,
	// joined back to their lesson + course names for the "Recently Watched" cards.
	const recentLessons = [...progressRows]
		.sort(
			(first, second) => second.updatedAt.getTime() - first.updatedAt.getTime(),
		)
		.slice(0, RECENT_LIMIT)
		.map((row) => {
			const lesson = lessonById.get(row.lessonId.toString());
			const course = courseById.get(row.courseId.toString());
			return {
				lessonId: row.lessonId.toString(),
				title: lesson?.title ?? "",
				courseTitle: course?.title ?? "",
				courseSlug: course?.slug ?? "",
				thumbnailUrl: thumbnailUrlByCourse.get(row.courseId.toString()) ?? "",
				updatedAt: row.updatedAt,
			};
		});

	const enrolled = courseRows.length;
	const inProgress = courseRows.filter(
		(course) => course.state === "in_progress",
	).length;

	const completed = courseRows.filter(
		(course) => course.state === "completed",
	).length;

	const lessonsCompleted = courseRows.reduce(
		(sum, course) => sum + course.completedLessons,
		0,
	);

	const totalLessons = courseRows.reduce(
		(sum, course) => sum + course.totalLessons,
		0,
	);

	const overallPercent =
		totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

	return {
		stats: {
			enrolled,
			inProgress,
			completed,
			lessonsCompleted,
			totalLessons,
			overallPercent,
		},
		courses: courseRows,
		recentLessons,
	};
};

export default getLearningOverview;

//* src/types/learning.types.ts

/** Lifecycle state of an enrolled course, derived from the learner's progress. */
export type LearningCourseState = "in_progress" | "not_started" | "completed";

/** The learner's aggregate learning stats across all enrollments. */
export interface LearningStatsPayload {
	enrolled: number;
	inProgress: number;
	completed: number;
	lessonsCompleted: number;
	totalLessons: number;
	overallPercent: number;
}

/** The next incomplete lesson to resume in a course. */
export interface NextLessonPayload {
	lessonId: string;
	title: string;
}

/** One enrolled course with its progress summary and resume target. */
export interface LearningCoursePayload {
	courseId: string;
	title: string;
	slug: string;
	thumbnailUrl: string;
	instructorName: string;
	totalLessons: number;
	completedLessons: number;
	percentComplete: number;
	state: LearningCourseState;
	lastActivityAt: string | null;
	nextLesson: NextLessonPayload | null;
}

/** A recently-watched lesson, joined to its parent course. */
export interface RecentLessonPayload {
	lessonId: string;
	title: string;
	courseTitle: string;
	courseSlug: string;
	updatedAt: string;
}

/** The learner's whole learning overview: stats, per-course progress, and recent lessons. */
export interface LearningOverviewPayload {
	stats: LearningStatsPayload;
	courses: LearningCoursePayload[];
	recentLessons: RecentLessonPayload[];
}

//* src/lib/courseProgress.ts

import type { ProgressPayload } from "@/types/progress.types";

export type LessonCompletionState = "not-started" | "in-progress" | "completed";

/** Index the caller's progress rows by lessonId for O(1) per-lesson lookup. */
export const indexProgressByLesson = (
	rows: ProgressPayload[],
): Map<string, ProgressPayload> =>
	new Map(rows.map((row) => [row.lessonId, row]));

/** The three-state completion status for a lesson given its progress row. */
export const lessonCompletionState = (
	row: ProgressPayload | undefined,
): LessonCompletionState => {
	if (!row) return "not-started";
	if (row.completed) return "completed";
	return "in-progress";
};

/** Fraction (0–1) of a lesson watched, for the in-progress ring. */
export const lessonWatchedFraction = (
	row: ProgressPayload | undefined,
	durationSeconds: number,
): number => {
	if (!row || durationSeconds <= 0) return 0;
	const fraction = row.positionSeconds / durationSeconds;
	return Math.min(1, Math.max(0, fraction));
};

/** Overall course completion percent (0–100, rounded). */
export const courseCompletionPercent = (
	completedCount: number,
	totalCount: number,
): number => {
	if (totalCount <= 0) return 0;
	return Math.round((completedCount / totalCount) * 100);
};

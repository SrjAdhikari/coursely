//* src/api/progress.api.ts

import axiosClient from "@/config/axiosClient";

import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	ProgressPayload,
	SaveProgressPayload,
} from "@/types/progress.types";

/** Report a playhead for a lesson (server derives completion). */
const saveLessonProgress = async (args: {
	lessonId: string;
	payload: SaveProgressPayload;
}) => {
	const { data } = await axiosClient.put<ApiSuccessResponse<ProgressPayload>>(
		`/progress/${args.lessonId}`,
		args.payload,
	);
	return data;
};

/** The caller's own progress rows for a course. */
const getCourseProgress = async (courseId: string) => {
	const { data } = await axiosClient.get<ApiSuccessResponse<ProgressPayload[]>>(
		`/progress/course/${courseId}`,
	);
	return data;
};

export { saveLessonProgress, getCourseProgress };

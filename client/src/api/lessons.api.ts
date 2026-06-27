//* src/api/lessons.api.ts

import axiosClient from "@/config/axiosClient";

import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	LessonPayload,
	CreateLessonPayload,
	UpdateLessonPayload,
} from "@/types/course.types";

/** Create a lesson under a section. */
const createLesson = async (args: {
	sectionId: string;
	payload: CreateLessonPayload;
}) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<LessonPayload>>(
		`/admin/sections/${args.sectionId}/lessons`,
		args.payload,
	);
	return data;
};

/** Update a lesson. */
const updateLesson = async (args: {
	id: string;
	payload: UpdateLessonPayload;
}) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<LessonPayload>>(
		`/admin/lessons/${args.id}`,
		args.payload,
	);
	return data;
};

/** Delete a lesson. */
const deleteLesson = async (id: string) => {
	const { data } = await axiosClient.delete<ApiSuccessResponse>(
		`/admin/lessons/${id}`,
	);
	return data;
};

export { createLesson, updateLesson, deleteLesson };

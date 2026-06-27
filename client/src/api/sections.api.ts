//* src/api/sections.api.ts

import axiosClient from "@/config/axiosClient";

import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	SectionPayload,
	CreateSectionPayload,
	UpdateSectionPayload,
} from "@/types/course.types";

/** Create a section under a course. */
const createSection = async (args: {
	courseId: string;
	payload: CreateSectionPayload;
}) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<SectionPayload>>(
		`/admin/courses/${args.courseId}/sections`,
		args.payload,
	);
	return data;
};

/** Update a section. */
const updateSection = async (args: {
	id: string;
	payload: UpdateSectionPayload;
}) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<SectionPayload>>(
		`/admin/sections/${args.id}`,
		args.payload,
	);
	return data;
};

/** Delete a section (cascades its lessons server-side). */
const deleteSection = async (id: string) => {
	const { data } = await axiosClient.delete<ApiSuccessResponse>(
		`/admin/sections/${id}`,
	);
	return data;
};

export { createSection, updateSection, deleteSection };

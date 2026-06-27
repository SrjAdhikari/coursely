//* src/api/courses.api.ts

import axiosClient from "@/config/axiosClient";

import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	CoursePayload,
	CourseWithCurriculum,
	CreateCoursePayload,
	UpdateCoursePayload,
} from "@/types/course.types";

/** List all courses (drafts + published) for the admin table. */
const listCourses = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<CoursePayload[]>>(
			"/admin/courses",
		);
	return data;
};

/** Get one course with its full nested curriculum. */
const getCourse = async (id: string) => {
	const { data } = await axiosClient.get<
		ApiSuccessResponse<CourseWithCurriculum>
	>(`/admin/courses/${id}`);
	return data;
};

/** Create a new course. */
const createCourse = async (payload: CreateCoursePayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<CoursePayload>>(
		"/admin/courses",
		payload,
	);
	return data;
};

/** Update an existing course. */
const updateCourse = async (args: {
	id: string;
	payload: UpdateCoursePayload;
}) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<CoursePayload>>(
		`/admin/courses/${args.id}`,
		args.payload,
	);
	return data;
};

/** Delete a course. */
const deleteCourse = async (id: string) => {
	const { data } = await axiosClient.delete<ApiSuccessResponse>(
		`/admin/courses/${id}`,
	);
	return data;
};

export { listCourses, getCourse, createCourse, updateCourse, deleteCourse };

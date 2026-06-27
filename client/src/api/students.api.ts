//* src/api/students.api.ts

import axiosClient from "@/config/axiosClient";

import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	StudentPayload,
	UpdateStudentPayload,
} from "@/types/student.types";

/** List all students for the admin table. */
const listStudents = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<StudentPayload[]>>(
			"/admin/students",
		);
	return data;
};

/** Fetch a single student by their ID. */
const getStudent = async (id: string) => {
	const { data } = await axiosClient.get<ApiSuccessResponse<StudentPayload>>(
		`/admin/students/${id}`,
	);
	return data;
};

/** Update a student's role and/or account status. */
const updateStudent = async (args: {
	id: string;
	payload: UpdateStudentPayload;
}) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<StudentPayload>>(
		`/admin/students/${args.id}`,
		args.payload,
	);
	return data;
};

export { listStudents, getStudent, updateStudent };

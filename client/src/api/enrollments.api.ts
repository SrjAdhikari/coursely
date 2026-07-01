//* src/api/enrollments.api.ts

import axiosClient from "@/config/axiosClient";

import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	MyEnrollmentPayload,
	AdminEnrollmentPayload,
	PaginatedPayload,
} from "@/types/enrollment.types";

/** The current student's own enrollments (My Courses). */
const getMyEnrollments = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<MyEnrollmentPayload[]>>(
			"/enrollments/me",
		);
	return data;
};

/** List all enrollments for the admin table (paginated). */
const listEnrollments = async (args: { page: number; limit: number }) => {
	const { data } = await axiosClient.get<
		ApiSuccessResponse<PaginatedPayload<AdminEnrollmentPayload>>
	>("/admin/enrollments", { params: { page: args.page, limit: args.limit } });
	return data;
};

export { getMyEnrollments, listEnrollments };

//* src/api/learning.api.ts

import axiosClient from "@/config/axiosClient";

import type { ApiSuccessResponse } from "@/types/api.types";
import type { LearningOverviewPayload } from "@/types/learning.types";

/** The caller's aggregated learning overview (stats + course progress + recent). */
const getLearningOverview = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<LearningOverviewPayload>>(
			"/learning/overview",
		);
	return data;
};

export default getLearningOverview;

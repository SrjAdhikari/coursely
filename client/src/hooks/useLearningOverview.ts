//* src/hooks/useLearningOverview.ts

import { useQuery } from "@tanstack/react-query";

import getLearningOverview from "@/api/learning.api";
import { LEARNING_OVERVIEW_KEY } from "@/lib/queryKeys";

/** The caller's aggregated learning overview. */
const useLearningOverview = () =>
	useQuery({
		queryKey: LEARNING_OVERVIEW_KEY,
		queryFn: getLearningOverview,
	});

export default useLearningOverview;

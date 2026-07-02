//* src/hooks/useProgress.ts

import { useMutation, useQuery } from "@tanstack/react-query";

import { getCourseProgress, saveLessonProgress } from "@/api/progress.api";
import { courseProgressKey } from "@/lib/queryKeys";

/** The caller's own progress rows for a course. */
const useCourseProgress = (courseId: string) =>
	useQuery({
		queryKey: courseProgressKey(courseId),
		queryFn: () => getCourseProgress(courseId),
		enabled: !!courseId,
	});

/** Report a playhead for a lesson (server derives completion). */
const useSaveProgress = () => useMutation({ mutationFn: saveLessonProgress });

export { useCourseProgress, useSaveProgress };

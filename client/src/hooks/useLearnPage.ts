//* src/hooks/useLearnPage.ts

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useGetCourseBySlug } from "@/hooks/useCourses";
import { useMyEnrollments } from "@/hooks/useEnrollments";
import { useCourseProgress, useSaveProgress } from "@/hooks/useProgress";

import { courseProgressKey } from "@/lib/queryKeys";
import {
	indexProgressByLesson,
	courseCompletionPercent,
} from "@/lib/courseProgress";

/**
 * Controller for the learner watch page: owns data fetching, progress
 * derivation, and the per-course resume latch. Gates/JSX stay in the page.
 */
export const useLearnPage = (courseSlug: string, lessonId?: string) => {
	const queryClient = useQueryClient();

	const {
		data: courseResponse,
		isLoading: isCourseLoading,
		isError: isCourseError,
		refetch: refetchCourse,
	} = useGetCourseBySlug(courseSlug);

	const {
		data: enrollments,
		isLoading: isEnrollmentsLoading,
		isError: isEnrollmentsError,
		refetch: refetchEnrollments,
	} = useMyEnrollments();

	const course = courseResponse?.data;

	const {
		data: progressResponse,
		isLoading: isProgressLoading,
		isError: isProgressError,
		refetch: refetchProgress,
	} = useCourseProgress(course?._id ?? "");
	const { mutate: saveProgress } = useSaveProgress();

	const sections = useMemo(() => course?.sections ?? [], [course]);
	const allLessons = useMemo(
		() => sections.flatMap((section) => section.lessons),
		[sections],
	);

	const progressByLesson = useMemo(
		() => indexProgressByLesson(progressResponse?.data ?? []),
		[progressResponse],
	);

	const completedCount = useMemo(
		() =>
			allLessons.filter((lesson) => progressByLesson.get(lesson._id)?.completed)
				.length,
		[allLessons, progressByLesson],
	);

	const overallPercent = courseCompletionPercent(
		completedCount,
		allLessons.length,
	);

	// Resume target: the first not-completed lesson, else the first lesson.
	const resumeLessonId = useMemo(() => {
		const firstIncomplete = allLessons.find(
			(lesson) => !progressByLesson.get(lesson._id)?.completed,
		);
		return (firstIncomplete ?? allLessons[0])?._id;
	}, [allLessons, progressByLesson]);

	// Latch the resume lesson per course (only after progress loads) so a refetch
	// or course switch can't swap the active lesson mid-playback.
	const [latchedResume, setLatchedResume] = useState<{
		courseId: string;
		lessonId: string;
	} | null>(null);

	if (
		course &&
		progressResponse &&
		resumeLessonId &&
		latchedResume?.courseId !== course._id
	) {
		setLatchedResume({ courseId: course._id, lessonId: resumeLessonId });
	}

	// Trust the latch only for the currently loaded course.
	const latchedLessonId =
		latchedResume?.courseId === course?._id
			? latchedResume?.lessonId
			: undefined;

	const currentLessonId = lessonId ?? latchedLessonId;
	const currentLesson = allLessons.find(
		(lesson) => lesson._id === currentLessonId,
	);

	const currentSection = sections.find(
		(section) => section._id === currentLesson?.sectionId,
	);

	const currentIndex = allLessons.findIndex(
		(lesson) => lesson._id === currentLesson?._id,
	);

	const resumePositionSeconds =
		progressByLesson.get(currentLesson?._id ?? "")?.positionSeconds ?? 0;

	const handleReportPosition = useCallback(
		(seconds: number) => {
			if (!currentLesson || !course) return;
			saveProgress(
				{
					lessonId: currentLesson._id,
					payload: { positionSeconds: Math.floor(seconds) },
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({
							queryKey: courseProgressKey(course._id),
						});
					},
				},
			);
		},
		[currentLesson, course, saveProgress, queryClient],
	);

	return {
		course,
		sections,
		progressByLesson,
		completedCount,
		overallPercent,
		totalLessons: allLessons.length,
		currentLessonId,
		currentLesson,
		currentSection,
		currentIndex,
		resumePositionSeconds,
		handleReportPosition,
		isCourseLoading,
		isCourseError,
		isEnrollmentsLoading,
		isEnrollmentsError,
		isProgressLoading,
		isProgressError,
		isEnrolled: (enrollments?.data ?? []).some(
			(enrollment) => enrollment.courseId._id === course?._id,
		),
		refetchCourse,
		refetchEnrollments,
		refetchProgress,
	};
};

//* src/pages/LearnPage.tsx

import { useCallback, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";

import ROUTES from "@/routes/paths";

import { useGetCourseBySlug } from "@/hooks/useCourses";
import { useMyEnrollments } from "@/hooks/useEnrollments";
import { useCourseProgress, useSaveProgress } from "@/hooks/useProgress";

import VideoPlayer from "@/components/media/VideoPlayer";
import LessonStateIcon from "@/components/learn/LessonStateIcon";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";

import { formatLessonDuration } from "@/lib/duration";
import { cn } from "@/lib/utils";
import { courseProgressKey } from "@/lib/queryKeys";
import {
	indexProgressByLesson,
	lessonCompletionState,
	lessonWatchedFraction,
	courseCompletionPercent,
} from "@/lib/courseProgress";

/** The learner watch page — video stage + sticky curriculum + Overview tab. */
const LearnPage = () => {
	const { courseSlug = "", lessonId } = useParams();
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

	if (isCourseLoading || isEnrollmentsLoading)
		return <Loader className="min-h-screen" />;

	if (isCourseError || !course)
		return (
			<LoadFailed
				title="Course not found"
				description="We couldn't load that course. It may have been unpublished, or the link is wrong."
				onRetry={() => refetchCourse()}
				backTo={ROUTES.MY_COURSES}
				backLabel="Back to My Courses"
			/>
		);

	// Don't derive enrollment/resume from a failed request (empty ≠ error) — retry.
	if (isEnrollmentsError || isProgressError)
		return (
			<LoadFailed
				title="Couldn't load your course"
				description="We hit a problem loading your enrollment and progress. Check your connection and try again."
				onRetry={() => {
					if (isEnrollmentsError) refetchEnrollments();
					if (isProgressError) refetchProgress();
				}}
				backTo={ROUTES.MY_COURSES}
				backLabel="Back to My Courses"
			/>
		);

	const isEnrolled = (enrollments?.data ?? []).some(
		(row) => row.courseId._id === course._id,
	);

	if (!isEnrolled)
		return <Navigate to={ROUTES.COURSE_DETAIL(course.slug)} replace />;

	// No lesson in the URL: wait for progress before auto-picking the lesson.
	if (!lessonId && isProgressLoading)
		return <Loader className="min-h-screen" />;

	// URL lesson id not in this course → not-found (don't swap to lesson 1).
	if (lessonId && !currentLesson)
		return (
			<LoadFailed
				title="Lesson not found"
				description="We couldn't find that lesson in this course. It may have been moved or removed."
				onRetry={() => refetchCourse()}
				backTo={ROUTES.COURSE_DETAIL(course.slug)}
				backLabel="Back to course"
			/>
		);

	if (!currentLesson)
		return (
			<LoadFailed
				title="No lessons yet"
				description="This course doesn't have any lessons to watch yet."
				onRetry={() => refetchCourse()}
				backTo={ROUTES.MY_COURSES}
				backLabel="Back to My Courses"
			/>
		);

	return (
		<div className="mx-auto max-w-7xl px-4 py-6">
			<Link
				to={ROUTES.MY_COURSES}
				className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to My Courses
			</Link>

			<div className="mt-4 lg:flex lg:items-start lg:gap-6">
				{/* MAIN COLUMN */}
				<section className="min-w-0 flex-1">
					<div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
						<VideoPlayer
							key={currentLesson._id}
							lessonId={currentLesson._id}
							resumePositionSeconds={resumePositionSeconds}
							onReportPosition={handleReportPosition}
						/>

						<p className="flex items-center gap-2 border-t border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
							<Check className="size-4 text-success" aria-hidden />
							Lessons mark complete automatically once you reach 95% watched.
						</p>
					</div>

					{resumePositionSeconds > 0 && (
						<p className="mt-3 text-sm text-muted-foreground">
							Resuming from{" "}
							<span className="font-medium text-primary">
								{formatLessonDuration(resumePositionSeconds)}
							</span>
						</p>
					)}

					<div className="mt-6">
						<span className="text-xs uppercase tracking-wide text-primary">
							{currentSection?.title} · Lesson {currentIndex + 1} of{" "}
							{allLessons.length}
						</span>

						<h1 className="mt-2 font-heading text-xl leading-snug">
							{currentLesson.title}
						</h1>

						<Tabs defaultValue="overview" className="mt-5">
							<TabsList>
								<TabsTrigger value="overview">Overview</TabsTrigger>
							</TabsList>

							<TabsContent value="overview">
								<p className="max-w-prose leading-relaxed text-muted-foreground">
									{course.description}
								</p>
							</TabsContent>
						</Tabs>
					</div>
				</section>

				{/* CURRICULUM SIDEBAR */}
				<aside className="mt-6 lg:mt-0 lg:sticky lg:top-20 lg:w-90 lg:shrink-0">
					<div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
						<div className="border-b border-border p-4">
							<h2 className="font-heading text-lg leading-snug">
								{course.title}
							</h2>

							<p className="mt-1 text-sm text-muted-foreground">
								{course.instructorName}
							</p>

							<div className="mt-4">
								<Progress value={overallPercent} />
								<div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
									<span>
										{completedCount} of {allLessons.length} lessons
									</span>

									<span className="font-medium text-primary">
										{overallPercent}% complete
									</span>
								</div>
							</div>
						</div>

						<div className="max-h-160 overflow-y-auto p-2">
							{sections.map((section) => (
								<div key={section._id}>
									<div className="px-3 pt-4 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
										{section.title}
									</div>

									{section.lessons.map((lesson) => {
										const row = progressByLesson.get(lesson._id);
										const state = lessonCompletionState(row);
										const isCurrent = lesson._id === currentLesson._id;

										return (
											<Link
												key={lesson._id}
												to={ROUTES.LEARN_LESSON(course.slug, lesson._id)}
												aria-current={isCurrent ? "true" : undefined}
												className={cn(
													"flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
													isCurrent &&
														"bg-primary/10 font-semibold text-foreground",
												)}
											>
												<LessonStateIcon
													state={state}
													watchedFraction={lessonWatchedFraction(
														row,
														lesson.duration,
													)}
												/>

												<span className="min-w-0 flex-1 leading-snug">
													{lesson.title}
												</span>

												<span className="shrink-0 text-xs text-muted-foreground">
													{formatLessonDuration(lesson.duration)}
												</span>
											</Link>
										);
									})}
								</div>
							))}
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default LearnPage;

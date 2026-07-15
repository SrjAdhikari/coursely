//* src/pages/LearnPage.tsx

import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft, Check } from "lucide-react";

import ROUTES from "@/routes/paths";

import { useLearnPage } from "@/hooks/useLearnPage";

import VideoPlayer from "@/components/media/VideoPlayer";
import CurriculumSidebar from "@/components/learn/CurriculumSidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";

import { formatLessonDuration } from "@/lib/duration";

/** The learner watch page — video stage + sticky curriculum + Overview tab. */
const LearnPage = () => {
	const { courseSlug = "", lessonId } = useParams();

	const {
		course,
		sections,
		progressByLesson,
		completedCount,
		overallPercent,
		totalLessons,
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
		isEnrolled,
		refetchCourse,
		refetchEnrollments,
		refetchProgress,
	} = useLearnPage(courseSlug, lessonId);

	if (isCourseLoading || isEnrollmentsLoading) return <Loader />;

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

	if (!isEnrolled)
		return <Navigate to={ROUTES.COURSE_DETAIL(course.slug)} replace />;

	// No lesson in the URL: wait for progress before auto-picking the lesson.
	if (!lessonId && isProgressLoading) return <Loader />;

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
							poster={course.thumbnailUrl}
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
							{totalLessons}
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

				<CurriculumSidebar
					courseTitle={course.title}
					instructorName={course.instructorName}
					courseSlug={course.slug}
					sections={sections}
					progressByLesson={progressByLesson}
					currentLessonId={currentLesson._id}
					overallPercent={overallPercent}
					completedCount={completedCount}
					totalLessons={totalLessons}
				/>
			</div>
		</div>
	);
};

export default LearnPage;

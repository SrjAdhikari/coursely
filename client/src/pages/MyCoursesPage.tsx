//* src/pages/MyCoursesPage.tsx

import { Link } from "react-router";
import { GraduationCap } from "lucide-react";

import ROUTES from "@/routes/paths";
import useLearningOverview from "@/hooks/useLearningOverview";
import type { LearningCourseState } from "@/types/learning.types";

import CourseProgressRow from "@/components/dashboard/CourseProgressRow";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import { Button } from "@/components/ui/button";

const GROUPS: { state: LearningCourseState; label: string }[] = [
	{ state: "in_progress", label: "In progress" },
	{ state: "not_started", label: "Not started" },
	{ state: "completed", label: "Completed" },
];

/** The student's full enrolled library, grouped by progress state. */
const MyCoursesPage = () => {
	const { data, isLoading, isError, refetch } = useLearningOverview();
	const overview = data?.data;
	const courses = overview?.courses ?? [];

	if (isLoading) return <Loader />;

	if (isError)
		return (
			<LoadFailed
				title="Couldn't load your courses"
				description="Something went wrong while loading your courses. Check your connection and try again."
				onRetry={() => refetch()}
			/>
		);

	if (courses.length === 0)
		return (
			<EmptyStatePlaceholder
				icon={GraduationCap}
				title="No courses yet"
				description="Browse the catalog and enroll to start learning."
			>
				<Button asChild>
					<Link to={ROUTES.CATALOG}>Browse courses</Link>
				</Button>
			</EmptyStatePlaceholder>
		);

	const lessonsDone = overview?.stats.lessonsCompleted ?? 0;
	const lessonsTotal = overview?.stats.totalLessons ?? 0;

	return (
		<section className="space-y-8">
			<div>
				<h1 className="font-heading text-3xl font-semibold">My Courses</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					{courses.length} courses · {lessonsDone} of {lessonsTotal} lessons
					done
				</p>
			</div>

			{GROUPS.map(({ state, label }) => {
				const group = courses.filter((course) => course.state === state);
				if (group.length === 0) return null;

				return (
					<div key={state}>
						<div className="mb-4 flex items-center gap-3">
							<h2 className="flex-none text-xs uppercase tracking-wide text-primary">
								{label}
							</h2>

							<span className="flex-none text-xs text-muted-foreground">
								{group.length} {group.length === 1 ? "course" : "courses"}
							</span>

							<span aria-hidden className="h-px flex-1 bg-border" />
						</div>

						<div className="space-y-3">
							{group.map((course) => (
								<CourseProgressRow key={course.courseId} course={course} />
							))}
						</div>
					</div>
				);
			})}
		</section>
	);
};

export default MyCoursesPage;

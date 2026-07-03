//* src/pages/DashboardPage.tsx

import { Link } from "react-router";
import { GraduationCap } from "lucide-react";

import ROUTES from "@/routes/paths";
import { useCurrentUser } from "@/hooks/useAuth";
import useLearningOverview from "@/hooks/useLearningOverview";

import StatCard from "@/components/admin/StatCard";
import OverallProgressCard from "@/components/dashboard/OverallProgressCard";
import ContinueLearningCard from "@/components/dashboard/ContinueLearningCard";
import CourseProgressRow from "@/components/dashboard/CourseProgressRow";
import RecentlyWatched from "@/components/dashboard/RecentlyWatched";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
	const { data: userData } = useCurrentUser();
	const firstName = userData?.data?.name?.split(" ")[0] ?? "there";

	const { data, isLoading, isError, refetch } = useLearningOverview();
	const overview = data?.data;

	if (isLoading) return <Loader />;

	if (isError || !overview)
		return (
			<LoadFailed
				title="Couldn't load your dashboard"
				description="Something went wrong while loading your dashboard. Check your connection and try again."
				onRetry={() => refetch()}
			/>
		);

	const { stats, courses, recentLessons } = overview;

	if (stats.enrolled === 0)
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

	// Dashboard surfaces only courses with activity; not-started lives in My Courses.
	const activeCourses = courses.filter(
		(course) => course.state === "in_progress" || course.state === "completed",
	);

	return (
		<div className="space-y-10">
			<div>
				<h1 className="font-heading text-3xl font-semibold">
					Welcome back, {firstName} 👋
				</h1>

				<p className="mt-1.5 text-sm text-muted-foreground">
					Here's your activity overview. Jump back into a course or discover
					something new.
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
				<div className="grid grid-cols-2 gap-4">
					<StatCard
						label="Enrolled"
						value={stats.enrolled}
						sub="in your library"
					/>
					<StatCard
						label="In progress"
						value={stats.inProgress}
						sub="active courses"
					/>
					<StatCard
						label="Completed"
						value={stats.completed}
						sub="finished courses"
					/>
					<StatCard
						label="Lessons completed"
						value={stats.lessonsCompleted}
						sub={`of ${stats.totalLessons} total`}
					/>
				</div>

				<OverallProgressCard
					percent={stats.overallPercent}
					completed={stats.lessonsCompleted}
					total={stats.totalLessons}
				/>
			</div>

			<ContinueLearningCard courses={courses} />

			<section>
				<div className="mb-4 flex items-end justify-between">
					<h2 className="font-heading text-xl font-semibold">Your courses</h2>

					<Link to={ROUTES.MY_COURSES} className="text-sm text-primary">
						View all →
					</Link>
				</div>

				<div className="space-y-3">
					{activeCourses.length === 0 ? (
						<p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
							Nothing in progress yet — pick one from{" "}
							<Link to={ROUTES.MY_COURSES} className="text-primary">
								My Courses
							</Link>{" "}
							to get going.
						</p>
					) : (
						activeCourses.map((course) => (
							<CourseProgressRow key={course.courseId} course={course} />
						))
					)}
				</div>
			</section>

			<RecentlyWatched lessons={recentLessons} />
		</div>
	);
};

export default DashboardPage;

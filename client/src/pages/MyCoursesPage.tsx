//* src/pages/MyCoursesPage.tsx

import { useMemo } from "react";
import { Link } from "react-router";
import { GraduationCap } from "lucide-react";

import ROUTES from "@/routes/paths";
import { useMyEnrollments } from "@/hooks/useEnrollments";

import EnrolledCourseCard from "@/components/common/EnrolledCourseCard";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import { Button } from "@/components/ui/button";

/** The student's own enrolled courses. */
const MyCoursesPage = () => {
	const { data, isLoading, isError, refetch } = useMyEnrollments();
	const enrollments = useMemo(() => data?.data ?? [], [data]);

	if (isLoading) return <Loader className="min-h-[80vh]" />;
	if (isError)
		return (
			<LoadFailed
				title="Couldn't load your courses"
				description="Something went wrong while loading your courses. Check your connection and try again."
				onRetry={() => refetch()}
			/>
		);

	return (
		<section>
			<div className="mb-7">
				<h1 className="font-heading text-3xl font-semibold">My Courses</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					{enrollments.length} enrolled
				</p>
			</div>

			{enrollments.length === 0 ? (
				<EmptyStatePlaceholder
					icon={GraduationCap}
					title="No courses yet"
					description="Browse the catalog and enroll to start learning."
				>
					<Button asChild>
						<Link to={ROUTES.CATALOG}>Browse courses</Link>
					</Button>
				</EmptyStatePlaceholder>
			) : (
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{enrollments.map((enrollment) => (
						<EnrolledCourseCard
							key={enrollment._id}
							enrollment={enrollment}
						/>
					))}
				</div>
			)}
		</section>
	);
};

export default MyCoursesPage;

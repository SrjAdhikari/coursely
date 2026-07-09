//* src/pages/admin/OverviewPage.tsx

import { useMemo } from "react";
import { useNavigate } from "react-router";

import { useListCourses } from "@/hooks/useCourses";
import { useListStudents } from "@/hooks/useStudents";
import { useListEnrollments } from "@/hooks/useEnrollments";

import ROUTES from "@/routes/paths";
import { formatPrice } from "@/lib/currency";
import { formatDate } from "@/lib/date";

import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/admin/StatCard";
import DataTable, { type Column } from "@/components/common/DataTable";
import LoadFailed from "@/components/common/LoadFailed";

import type { CoursePayload } from "@/types/course.types";
import type { AdminEnrollmentPayload } from "@/types/enrollment.types";

const ENROLLMENTS_FETCH_LIMIT = 100;
const viewAllLink =
	"cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-primary";

const recentCourseColumns: Column<CoursePayload>[] = [
	{
		header: "Course",
		cell: (course) => (
			<>
				<div className="font-semibold">{course.title}</div>
				<div className="font-mono text-[11.5px] text-muted-foreground">
					{course.slug}
				</div>
			</>
		),
	},
	{
		header: "Instructor",
		cellClassName: "text-muted-foreground",
		cell: (course) => course.instructorName,
	},
	{
		header: "Price",
		cellClassName: "font-mono font-bold",
		cell: (course) => formatPrice(course.price),
	},
	{
		header: "Status",
		cell: (course) => (
			<Badge variant={course.isPublished ? "success" : "muted"}>
				{course.isPublished ? "Live" : "Draft"}
			</Badge>
		),
	},
];

// Mirrors the columns on the full Enrollments page.
const enrollmentColumns: Column<AdminEnrollmentPayload>[] = [
	{
		header: "Student",
		cell: (enrollment) => (
			<>
				<div className="font-semibold">{enrollment.userId.name}</div>
				<div className="text-xs text-muted-foreground">
					{enrollment.userId.email}
				</div>
			</>
		),
	},
	{
		header: "Course",
		cellClassName: "text-muted-foreground",
		cell: (enrollment) => enrollment.courseId.title,
	},
	{
		header: "Amount",
		align: "right",
		cellClassName: "font-semibold",
		cell: (enrollment) =>
			enrollment.amountPaid === undefined
				? "—"
				: formatPrice(enrollment.amountPaid),
	},
	{
		header: "Enrolled",
		align: "right",
		cellClassName: "text-muted-foreground",
		cell: (enrollment) => formatDate(enrollment.createdAt),
	},
];

const OverviewPage = () => {
	const navigate = useNavigate();

	const {
		data: coursesData,
		isLoading: coursesLoading,
		isError: coursesError,
		refetch: refetchCourses,
	} = useListCourses();

	const {
		data: studentsData,
		isLoading: studentsLoading,
		isError: studentsError,
		refetch: refetchStudents,
	} = useListStudents();

	const {
		data: enrollmentsData,
		isLoading: enrollmentsLoading,
		isError: enrollmentsError,
		refetch: refetchEnrollments,
	} = useListEnrollments(1, ENROLLMENTS_FETCH_LIMIT);

	const courses = useMemo(() => coursesData?.data ?? [], [coursesData]);
	const studentCount = studentsData?.data?.length ?? 0;
	const liveCount = courses.filter((course) => course.isPublished).length;

	const enrollmentsResult = enrollmentsData?.data;
	const enrollments = useMemo(
		() => enrollmentsResult?.items ?? [],
		[enrollmentsResult],
	);
	const enrollmentCount = enrollmentsResult?.pagination.total ?? 0;

	// Sum the fetched page; a server aggregate is the scale-up past the fetch limit.
	const totalRevenue = useMemo(
		() =>
			enrollments.reduce(
				(runningTotal, enrollment) =>
					runningTotal + (enrollment.amountPaid ?? 0),
				0,
			),
		[enrollments],
	);

	// Enrollments arrive newest-first, so the first 5 are the most recent.
	const recentEnrollments = useMemo(() => enrollments.slice(0, 5), [enrollments]);

	// "Recently added" — newest first, regardless of the list endpoint's order.
	const recentCourses = useMemo(
		() =>
			[...courses]
				.sort(
					(first, second) =>
						new Date(second.createdAt).getTime() -
						new Date(first.createdAt).getTime(),
				)
				.slice(0, 5),
		[courses],
	);

	if (coursesLoading || studentsLoading || enrollmentsLoading)
		return <Loader className="min-h-[80vh]" />;

	if (coursesError || studentsError || enrollmentsError)
		return (
			<LoadFailed
				title="Couldn't load the overview"
				description="Something went wrong while loading your dashboard. Check your connection and try again."
				onRetry={() => {
					refetchCourses();
					refetchStudents();
					refetchEnrollments();
				}}
			/>
		);

	return (
		<section>
			<div className="mb-7">
				<h1 className="font-heading text-3xl font-semibold">Overview</h1>
				<p className="mt-1.5 font-mono text-sm text-muted-foreground">
					Your catalog and learners at a glance.
				</p>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					label="Students"
					value={studentCount}
					sub="Registered learners"
				/>
				<StatCard
					label="Courses"
					value={courses.length}
					sub={`${liveCount} live · ${courses.length - liveCount} draft`}
				/>
				<StatCard
					label="Enrollments"
					value={enrollmentCount}
					sub="Across all courses"
				/>
				<StatCard
					label="Revenue"
					value={formatPrice(totalRevenue)}
					sub="Gross sales"
				/>
			</div>

			<div className="space-y-6">
				<div className="overflow-hidden rounded-xl border border-border bg-card">
					<div className="flex items-center justify-between gap-3.5 border-b border-border p-4">
						<h2
							id="recent-courses-heading"
							className="font-heading text-lg font-semibold"
						>
							Recently added courses
						</h2>

						<button
							type="button"
							onClick={() => navigate(ROUTES.ADMIN_COURSES)}
							className={viewAllLink}
						>
							View all courses <span aria-hidden="true">→</span>
						</button>
					</div>

					{recentCourses.length === 0 ? (
						<p className="p-10 text-center font-mono text-sm text-muted-foreground">
							No courses yet.
						</p>
					) : (
						<DataTable
							columns={recentCourseColumns}
							rows={recentCourses}
							getRowKey={(course) => course._id}
							ariaLabelledby="recent-courses-heading"
						/>
					)}
				</div>

				<div className="overflow-hidden rounded-xl border border-border bg-card">
					<div className="flex items-center justify-between gap-3.5 border-b border-border p-4">
						<h2
							id="recent-enrollments-heading"
							className="font-heading text-lg font-semibold"
						>
							Recent enrollments
						</h2>

						<button
							type="button"
							onClick={() => navigate(ROUTES.ADMIN_ENROLLMENTS)}
							className={viewAllLink}
						>
							View all enrollments <span aria-hidden="true">→</span>
						</button>
					</div>

					{recentEnrollments.length === 0 ? (
						<p className="p-10 text-center font-mono text-sm text-muted-foreground">
							No enrollments yet.
						</p>
					) : (
						<DataTable
							columns={enrollmentColumns}
							rows={recentEnrollments}
							getRowKey={(enrollment) => enrollment._id}
							ariaLabelledby="recent-enrollments-heading"
						/>
					)}
				</div>
			</div>
		</section>
	);
};

export default OverviewPage;

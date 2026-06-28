//* src/pages/admin/OverviewPage.tsx

import { useMemo } from "react";
import { useNavigate } from "react-router";

import { useListCourses } from "@/hooks/useCourses";
import { useListStudents } from "@/hooks/useStudents";
import { formatPrice } from "@/lib/currency";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/admin/StatCard";
import DataTable, { type Column } from "@/components/common/DataTable";
import LoadFailed from "@/components/common/LoadFailed";
import ROUTES from "@/routes/paths";
import type { CoursePayload } from "@/types/course.types";

interface SampleEnrollment {
	id: string;
	student: string;
	course: string;
	amount: number;
	purchased: string;
}

// Phase 5 placeholder — sample platform enrollments shown until the
// payments/enrollment feature lands. The Enrollments + Revenue tiles and the
// "Recent enrollments" table all derive from this, so the page stays internally
// consistent; swap for the real enrollments API then.
const sampleEnrollments: SampleEnrollment[] = [
	{
		id: "e1",
		student: "Rahul Verma",
		course: "React from Scratch",
		amount: 89900,
		purchased: "Jun 23",
	},
	{
		id: "e2",
		student: "Karan Mehta",
		course: "JavaScript Essentials",
		amount: 69900,
		purchased: "Jun 21",
	},
	{
		id: "e3",
		student: "Priya Nair",
		course: "TS Deep Dive",
		amount: 129900,
		purchased: "Jun 18",
	},
	{
		id: "e4",
		student: "Ananya Iyer",
		course: "HTML Foundations",
		amount: 49900,
		purchased: "May 30",
	},
	{
		id: "e5",
		student: "Vikram Shah",
		course: "Node.js & Express APIs",
		amount: 99900,
		purchased: "May 22",
	},
];

const sampleRevenue = sampleEnrollments.reduce(
	(total, enrollment) => total + enrollment.amount,
	0,
);

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

const enrollmentColumns: Column<SampleEnrollment>[] = [
	{
		header: "Student",
		cellClassName: "font-medium",
		cell: (enrollment) => enrollment.student,
	},
	{
		header: "Course",
		cellClassName: "text-muted-foreground",
		cell: (enrollment) => enrollment.course,
	},
	{
		header: "Amount",
		cellClassName: "font-mono font-bold",
		cell: (enrollment) => formatPrice(enrollment.amount),
	},
	{
		header: "Purchased",
		cellClassName: "font-mono text-muted-foreground",
		cell: (enrollment) => enrollment.purchased,
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

	const courses = useMemo(() => coursesData?.data ?? [], [coursesData]);
	const studentCount = studentsData?.data?.length ?? 0;
	const liveCount = courses.filter((course) => course.isPublished).length;

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

	if (coursesLoading || studentsLoading)
		return <Loader className="min-h-[80vh]" />;

	if (coursesError || studentsError)
		return (
			<LoadFailed
				title="Couldn't load the overview"
				description="Something went wrong while loading your dashboard. Check your connection and try again."
				onRetry={() => {
					refetchCourses();
					refetchStudents();
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
					value={sampleEnrollments.length}
					sub="Across all courses"
				/>
				<StatCard
					label="Revenue"
					value={formatPrice(sampleRevenue)}
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

					<DataTable
						columns={enrollmentColumns}
						rows={sampleEnrollments}
						getRowKey={(enrollment) => enrollment.id}
						ariaLabelledby="recent-enrollments-heading"
					/>
				</div>
			</div>
		</section>
	);
};

export default OverviewPage;

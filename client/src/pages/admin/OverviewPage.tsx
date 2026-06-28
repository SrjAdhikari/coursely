//* src/pages/admin/OverviewPage.tsx

import { useMemo } from "react";
import { useNavigate } from "react-router";

import { useListCourses } from "@/hooks/useCourses";
import { useListStudents } from "@/hooks/useStudents";
import { formatPrice } from "@/lib/currency";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/admin/StatCard";
import OverviewLoadFailed from "@/components/admin/OverviewLoadFailed";
import ROUTES from "@/routes/paths";

// Phase 5 placeholder — sample platform enrollments shown until the
// payments/enrollment feature lands. The Enrollments + Revenue tiles and the
// "Recent enrollments" table all derive from this, so the page stays internally
// consistent; swap for the real enrollments API then.
const sampleEnrollments = [
	{ id: "e1", student: "Rahul Verma", course: "React from Scratch", amount: 89900, purchased: "Jun 23" },
	{ id: "e2", student: "Karan Mehta", course: "JavaScript Essentials", amount: 69900, purchased: "Jun 21" },
	{ id: "e3", student: "Priya Nair", course: "TS Deep Dive", amount: 129900, purchased: "Jun 18" },
	{ id: "e4", student: "Ananya Iyer", course: "HTML Foundations", amount: 49900, purchased: "May 30" },
	{ id: "e5", student: "Vikram Shah", course: "Node.js & Express APIs", amount: 99900, purchased: "May 22" },
];

const sampleRevenue = sampleEnrollments.reduce(
	(total, enrollment) => total + enrollment.amount,
	0,
);

const tableHeadRow =
	"border-b border-border text-left font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground";
const tableBodyRow =
	"border-b border-border text-sm last:border-0 hover:bg-muted/40";
const viewAllLink =
	"cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-primary";

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
		return <Loader className="min-h-[60vh]" />;

	if (coursesError || studentsError)
		return (
			<OverviewLoadFailed
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
						<table
							aria-labelledby="recent-courses-heading"
							className="w-full border-collapse"
						>
							<thead>
								<tr className={tableHeadRow}>
									<th scope="col" className="px-5 py-3 font-medium">
										Course
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Instructor
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Price
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Status
									</th>
								</tr>
							</thead>

							<tbody>
								{recentCourses.map((course) => (
									<tr key={course._id} className={tableBodyRow}>
										<td className="px-5 py-3.5">
											<div className="font-semibold">{course.title}</div>
											<div className="font-mono text-[11.5px] text-muted-foreground">
												{course.slug}
											</div>
										</td>

										<td className="px-5 py-3.5 text-muted-foreground">
											{course.instructorName}
										</td>

										<td className="px-5 py-3.5 font-mono font-bold">
											{formatPrice(course.price)}
										</td>

										<td className="px-5 py-3.5">
											<Badge variant={course.isPublished ? "success" : "muted"}>
												{course.isPublished ? "Live" : "Draft"}
											</Badge>
										</td>
									</tr>
								))}
							</tbody>
						</table>
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

					<table
						aria-labelledby="recent-enrollments-heading"
						className="w-full border-collapse"
					>
						<thead>
							<tr className={tableHeadRow}>
								<th scope="col" className="px-5 py-3 font-medium">
									Student
								</th>
								<th scope="col" className="px-5 py-3 font-medium">
									Course
								</th>
								<th scope="col" className="px-5 py-3 font-medium">
									Amount
								</th>
								<th scope="col" className="px-5 py-3 font-medium">
									Purchased
								</th>
							</tr>
						</thead>

						<tbody>
							{sampleEnrollments.map((enrollment) => (
								<tr key={enrollment.id} className={tableBodyRow}>
									<td className="px-5 py-3.5 font-medium">
										{enrollment.student}
									</td>

									<td className="px-5 py-3.5 text-muted-foreground">
										{enrollment.course}
									</td>

									<td className="px-5 py-3.5 font-mono font-bold">
										{formatPrice(enrollment.amount)}
									</td>

									<td className="px-5 py-3.5 font-mono text-muted-foreground">
										{enrollment.purchased}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
};

export default OverviewPage;

//* src/pages/admin/CoursesPage.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Plus, LibraryBig, SearchX } from "lucide-react";

import { useListCourses, useDeleteCourse } from "@/hooks/useCourses";
import useClientPagination from "@/hooks/useClientPagination";
import { formatPrice } from "@/lib/currency";
import { COURSES_KEY } from "@/lib/queryKeys";
import pluralize from "@/lib/pluralize";

import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import DataTable, { type Column } from "@/components/common/DataTable";
import Paginator from "@/components/common/Paginator";
import {
	RowActionButton,
	RowActions,
} from "@/components/common/RowActionButton";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadFailed from "@/components/common/LoadFailed";

import ROUTES from "@/routes/paths";
import type { CoursePayload } from "@/types/course.types";

const PAGE_SIZE = 10;

const CoursesPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data, isLoading, isError, refetch } = useListCourses();
	const { mutate: remove } = useDeleteCourse();

	const [query, setQuery] = useState("");
	const [toDelete, setToDelete] = useState<CoursePayload | null>(null);

	const courses = useMemo(() => data?.data ?? [], [data]);
	const filtered = useMemo(() => {
		const term = query.trim().toLowerCase();
		if (!term) return courses;

		return courses.filter((course) =>
			[course.title, course.slug, course.instructorName]
				.join(" ")
				.toLowerCase()
				.includes(term),
		);
	}, [courses, query]);

	const { page, setPage, pageItems, total, totalPages } = useClientPagination(
		filtered,
		PAGE_SIZE,
	);

	if (isLoading) return <Loader className="min-h-[80vh]" />;
	if (isError)
		return (
			<LoadFailed
				title="Couldn't load courses"
				description="Something went wrong while loading your courses. Check your connection and try again."
				onRetry={() => refetch()}
			/>
		);

	const confirmDelete = () => {
		if (!toDelete) return;
		remove(toDelete._id, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: COURSES_KEY });
				toast.success("Course deleted");
			},
			onError: (err) => toast.error(err.message),
		});
	};

	const columns: Column<CoursePayload>[] = [
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
		{
			header: "Actions",
			align: "right",
			cell: (course) => (
				<RowActions>
					<RowActionButton
						onClick={() => navigate(ROUTES.adminCourseCurriculum(course._id))}
					>
						Curriculum
					</RowActionButton>
					<RowActionButton
						onClick={() => navigate(ROUTES.adminCourseEdit(course._id))}
					>
						Edit
					</RowActionButton>
					<RowActionButton
						variant="destructive"
						aria-label={`Delete ${course.title}`}
						onClick={() => setToDelete(course)}
					>
						Delete
					</RowActionButton>
				</RowActions>
			),
		},
	];

	return (
		<section>
			<div className="mb-7 flex items-end justify-between gap-5">
				<div>
					<h1 className="font-heading text-3xl font-semibold">Courses</h1>
					<p className="mt-1.5 font-mono text-sm text-muted-foreground">
						Create, edit, publish and remove courses.
					</p>
				</div>

				<Button size="lg" onClick={() => navigate(ROUTES.ADMIN_COURSE_NEW)}>
					<Plus className="size-4" strokeWidth={2.5} />
					<span className="font-mono font-medium">New course</span>
				</Button>
			</div>

			<div className="overflow-hidden rounded-xl border border-border bg-card">
				<div className="flex items-center justify-between gap-3.5 border-b border-border p-4">
					<div className="flex max-w-80 flex-1 items-center gap-2.5 rounded-lg border border-input bg-card px-3 py-2 focus-within:border-primary/30">
						<Search className="size-4 text-muted-foreground" />
						<input
							value={query}
							onChange={(event) => {
								setQuery(event.target.value);
								setPage(1); // narrowing the search returns to the first page
							}}
							placeholder="Search courses…"
							aria-label="Search courses"
							className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
						/>
					</div>

					<span className="font-mono text-xs text-muted-foreground">
						{pluralize(courses.length, "course")}
					</span>
				</div>

				{filtered.length === 0 ? (
					courses.length === 0 ? (
						<EmptyStatePlaceholder
							icon={LibraryBig}
							title="No courses yet"
							description="Create your first course to get started."
						/>
					) : (
						<EmptyStatePlaceholder
							icon={SearchX}
							title="No matching courses"
							description="Try a different search term."
						/>
					)
				) : (
					<>
						<DataTable
							columns={columns}
							rows={pageItems}
							getRowKey={(course) => course._id}
						/>

						<Paginator
							page={page}
							pageSize={PAGE_SIZE}
							total={total}
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					</>
				)}
			</div>

			{toDelete && (
				<ConfirmDialog
					itemType="course"
					itemName={toDelete.title}
					onConfirm={confirmDelete}
					onClose={() => setToDelete(null)}
				/>
			)}
		</section>
	);
};

export default CoursesPage;

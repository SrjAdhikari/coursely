//* src/pages/admin/CoursesPage.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Plus, LibraryBig, SearchX } from "lucide-react";

import { useListCourses, useDeleteCourse } from "@/hooks/useCourses";
import { formatPrice } from "@/lib/currency";
import { COURSES_KEY } from "@/lib/queryKeys";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadFailed from "@/components/common/LoadFailed";
import ROUTES from "@/routes/paths";
import type { CoursePayload } from "@/types/course.types";

const rowAction =
	"cursor-pointer font-mono text-[13px] text-muted-foreground transition-colors";

const CoursesPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data, isLoading, isError, refetch } = useListCourses();
	const { mutate: remove } = useDeleteCourse();

	const [query, setQuery] = useState("");
	const [toDelete, setToDelete] = useState<CoursePayload | null>(null);

	const courses = useMemo(() => data?.data ?? [], [data]);
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return courses;

		return courses.filter((course) =>
			[course.title, course.slug, course.instructorName]
				.join(" ")
				.toLowerCase()
				.includes(q),
		);
	}, [courses, query]);

	if (isLoading) return <Loader className="min-h-[60vh]" />;
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
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search courses…"
							aria-label="Search courses"
							className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
						/>
					</div>

					<span className="font-mono text-xs text-muted-foreground">
						{courses.length} {courses.length === 1 ? "course" : "courses"}
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
					<table className="w-full border-collapse">
						<thead>
							<tr className="border-b border-border text-left font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground">
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
								<th scope="col" className="px-5 py-3 text-right font-medium">
									Actions
								</th>
							</tr>
						</thead>

						<tbody>
							{filtered.map((course) => (
								<tr
									key={course._id}
									className="border-b border-border text-sm last:border-0 hover:bg-muted/40"
								>
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

									<td className="px-5 py-3.5">
										<div className="flex justify-end gap-3.5">
											<button
												type="button"
												onClick={() =>
													navigate(ROUTES.adminCourseCurriculum(course._id))
												}
												className={`${rowAction} hover:text-primary`}
											>
												Curriculum
											</button>
											<button
												type="button"
												onClick={() =>
													navigate(ROUTES.adminCourseEdit(course._id))
												}
												className={`${rowAction} hover:text-primary`}
											>
												Edit
											</button>
											<button
												type="button"
												aria-label={`Delete ${course.title}`}
												onClick={() => setToDelete(course)}
												className={`${rowAction} hover:text-destructive`}
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
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

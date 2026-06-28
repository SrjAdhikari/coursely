//* src/pages/admin/CurriculumPage.tsx

import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Play, Pencil, Trash2 } from "lucide-react";

import { useGetCourse } from "@/hooks/useCourses";
import { useDeleteSection, useDeleteLesson } from "@/hooks/useCurriculum";
import SectionDialog from "@/components/admin/SectionDialog";
import LessonDialog from "@/components/admin/LessonDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadFailed from "@/components/common/LoadFailed";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { courseKey } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import ROUTES from "@/routes/paths";
import type { LessonPayload, SectionWithLessons } from "@/types/course.types";

const formatDuration = (seconds: number) =>
	`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

// Only one curriculum dialog is open at a time.
type Editing =
	| { kind: "section"; section?: SectionWithLessons }
	| { kind: "lesson"; sectionId: string; lesson?: LessonPayload }
	| null;

type Deleting = { kind: "section" | "lesson"; id: string; name: string } | null;

const CurriculumPage = () => {
	const { id = "" } = useParams();
	const queryClient = useQueryClient();
	const { data, isLoading, isError, refetch } = useGetCourse(id);

	const { mutate: removeSection } = useDeleteSection();
	const { mutate: removeLesson } = useDeleteLesson();

	const [editing, setEditing] = useState<Editing>(null);
	const [deleting, setDeleting] = useState<Deleting>(null);

	const course = data?.data;
	const sections = course?.sections ?? [];
	const lessonCount = sections.reduce(
		(total, section) => total + section.lessons.length,
		0,
	);

	const confirmDelete = () => {
		if (!deleting) return;
		const remove = deleting.kind === "section" ? removeSection : removeLesson;
		remove(deleting.id, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: courseKey(id) });
				toast.success(
					deleting.kind === "section" ? "Section deleted" : "Lesson deleted",
				);
				setDeleting(null);
			},
			onError: (err) => toast.error(err.message),
		});
	};

	if (isLoading) return <Loader className="min-h-[60vh]" />;
	if (isError || !course)
		return (
			<LoadFailed
				title="Couldn't load this course"
				description="It may have been removed, or something went wrong. Try again or go back to courses."
				onRetry={() => refetch()}
				backTo={ROUTES.ADMIN_COURSES}
				backLabel="Back to courses"
			/>
		);

	return (
		<section className="max-w-4xl">
			<div className="mb-2 text-xs text-muted-foreground">
				<Link to={ROUTES.ADMIN_COURSES} className="hover:text-foreground">
					Courses
				</Link>
				{" / "}
				<Link to={ROUTES.adminCourseEdit(id)} className="hover:text-foreground">
					{course.title}
				</Link>
				{" / Curriculum"}
			</div>

			<h1 className="font-heading text-3xl font-semibold">Curriculum</h1>
			<p className="mb-5 mt-1.5 text-sm text-muted-foreground">
				{course.title}
			</p>

			<div className="mb-4 text-xs text-muted-foreground">
				{sections.length} sections · {lessonCount} lessons
			</div>

			{sections.map((section, index) => (
				<div
					key={section._id}
					className="mb-3.5 overflow-hidden rounded-xl border border-border bg-card"
				>
					<div className="flex items-center gap-3 bg-muted/50 px-4 py-3.5">
						<span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
							{String(index + 1).padStart(2, "0")}
						</span>

						<h4 className="flex-1 font-semibold">{section.title}</h4>
						<span className="text-[11.5px] text-muted-foreground">
							{section.lessons.length} lessons
						</span>

						<Button
							variant="outline"
							size="icon-sm"
							aria-label={`Edit section ${section.title}`}
							onClick={() => setEditing({ kind: "section", section: section })}
						>
							<Pencil className="size-3.5" />
						</Button>

						<Button
							variant="outline"
							size="icon-sm"
							aria-label={`Delete section ${section.title}`}
							onClick={() =>
								setDeleting({
									kind: "section",
									id: section._id,
									name: section.title,
								})
							}
						>
							<Trash2 className="size-3.5" />
						</Button>
					</div>

					{section.lessons.map((lesson) => (
						<div
							key={lesson._id}
							className="flex items-center gap-3 border-t border-border px-4 py-3 text-sm"
						>
							<Play
								aria-hidden
								className={cn(
									"size-4",
									lesson.isPreview ? "text-primary" : "text-muted-foreground",
								)}
							/>
							<span className="flex-1">{lesson.title}</span>

							{lesson.isPreview && (
								<span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase text-primary">
									Preview
								</span>
							)}
							<span className="text-xs text-muted-foreground">
								{formatDuration(lesson.duration)}
							</span>

							<Button
								variant="outline"
								size="icon-sm"
								aria-label={`Edit lesson ${lesson.title}`}
								onClick={() =>
									setEditing({
										kind: "lesson",
										sectionId: section._id,
										lesson: lesson,
									})
								}
							>
								<Pencil className="size-3.5" />
							</Button>

							<Button
								variant="outline"
								size="icon-sm"
								aria-label={`Delete lesson ${lesson.title}`}
								onClick={() =>
									setDeleting({
										kind: "lesson",
										id: lesson._id,
										name: lesson.title,
									})
								}
							>
								<Trash2 className="size-3.5" />
							</Button>
						</div>
					))}

					<button
						type="button"
						onClick={() =>
							setEditing({ kind: "lesson", sectionId: section._id })
						}
						className="flex w-full items-center gap-2.5 border-t border-dashed border-border px-4 py-3 font-mono text-xs text-muted-foreground hover:bg-muted/40 hover:text-primary"
					>
						<Plus className="size-3.5" /> Add lesson
					</button>
				</div>
			))}

			<button
				type="button"
				onClick={() => setEditing({ kind: "section" })}
				className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-dashed border-input py-4 font-mono text-sm text-muted-foreground hover:border-primary/30 hover:text-primary"
			>
				<Plus className="size-4" /> Add section
			</button>

			{editing?.kind === "section" && (
				<SectionDialog
					courseId={id}
					section={editing.section}
					onClose={() => setEditing(null)}
				/>
			)}

			{editing?.kind === "lesson" && (
				<LessonDialog
					courseId={id}
					sectionId={editing.sectionId}
					lesson={editing.lesson}
					onClose={() => setEditing(null)}
				/>
			)}

			{deleting && (
				<ConfirmDialog
					itemType={deleting.kind}
					itemName={deleting.name}
					onConfirm={confirmDelete}
					onClose={() => setDeleting(null)}
				/>
			)}
		</section>
	);
};

export default CurriculumPage;

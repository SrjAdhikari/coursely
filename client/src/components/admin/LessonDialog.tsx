//* src/components/admin/LessonDialog.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import FormField from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import { useCreateLesson, useUpdateLesson } from "@/hooks/useCurriculum";
import { lessonFormSchema, type LessonFormData } from "@/schemas/lesson.schema";
import { courseKey } from "@/lib/queryKeys";
import type { LessonPayload } from "@/types/course.types";

interface LessonDialogProps {
	courseId: string;
	sectionId: string;
	lesson?: LessonPayload; // present → edit, absent → create
	onClose: () => void;
}

const toNum = (value: string) =>
	value.trim() === "" ? undefined : Number(value);

/** Add / edit a lesson within a section. Owns its mutation + call-site invalidation. */
const LessonDialog = ({
	courseId,
	sectionId,
	lesson,
	onClose,
}: LessonDialogProps) => {
	const isEdit = !!lesson;
	const queryClient = useQueryClient();

	const { mutate: create, isPending: creating } = useCreateLesson();
	const { mutate: update, isPending: updating } = useUpdateLesson();

	const {
		register,
		handleSubmit,
		trigger,
		formState: { errors, isValid },
	} = useForm<LessonFormData>({
		mode: "onChange",
		resolver: zodResolver(lessonFormSchema),
		defaultValues: {
			title: lesson?.title ?? "",
			order: lesson ? String(lesson.order) : "",
			duration: lesson ? String(lesson.duration) : "",
			isPreview: lesson?.isPreview ?? false,
		},
	});

	// Edit mode: validate the prefilled values so Save enables without a field
	// change (create mode stays invalid until the title is typed).
	useEffect(() => {
		if (lesson) void trigger();
	}, [lesson, trigger]);

	const done = (message: string) => {
		queryClient.invalidateQueries({ queryKey: courseKey(courseId) });
		toast.success(message);
		onClose();
	};

	const onSubmit = (values: LessonFormData) => {
		const payload = {
			title: values.title,
			order: toNum(values.order),
			duration: toNum(values.duration),
			isPreview: values.isPreview,
		};
		if (lesson) {
			update(
				{ id: lesson._id, payload },
				{
					onSuccess: () => done("Lesson updated"),
					onError: (err) => toast.error(err.message),
				},
			);
		} else {
			create(
				{ sectionId, payload },
				{
					onSuccess: () => done("Lesson added"),
					onError: (err) => toast.error(err.message),
				},
			);
		}
	};

	const pending = creating || updating;

	return (
		<Dialog open onOpenChange={(next) => !next && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit lesson" : "Add lesson"}</DialogTitle>
					<DialogDescription>
						Lessons are the individual videos within a section.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					className="space-y-4"
				>
					<FormField
						label="Lesson title"
						id="lesson-title"
						placeholder="e.g. Your first component"
						error={errors.title?.message}
						{...register("title")}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormField
							label="Duration (seconds)"
							id="lesson-duration"
							inputMode="numeric"
							placeholder="0"
							error={errors.duration?.message}
							{...register("duration")}
						/>

						<FormField
							label="Order"
							id="lesson-order"
							inputMode="numeric"
							placeholder="0"
							hint="Optional"
							error={errors.order?.message}
							{...register("order")}
						/>
					</div>

					<label className="flex items-center gap-2.5 text-sm">
						<input type="checkbox" {...register("isPreview")} /> Free preview
						<span className="text-[11px] text-muted-foreground">
							— playable before purchase
						</span>
					</label>

					<FormField
						label="Video"
						id="lesson-video"
						disabled
						placeholder="courses/react/lesson.mp4"
						labelExtra={
							<span className="text-[11px] font-normal text-muted-foreground">
								uploaded in Phase 4 · R2
							</span>
						}
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={onClose}
							disabled={pending}
						>
							Cancel
						</Button>

						<Button type="submit" size="lg" disabled={pending || !isValid}>
							{isEdit ? "Save changes" : "Add lesson"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default LessonDialog;

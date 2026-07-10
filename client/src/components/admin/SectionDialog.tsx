//* src/components/admin/SectionDialog.tsx

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
import { useCreateSection, useUpdateSection } from "@/hooks/useCurriculum";
import {
	sectionFormSchema,
	type SectionFormData,
} from "@/schemas/section.schema";
import { courseKey } from "@/lib/queryKeys";
import type { SectionPayload } from "@/types/course.types";

interface SectionDialogProps {
	courseId: string;
	section?: SectionPayload; // present → edit, absent → create
	onClose: () => void;
}

const toOrder = (value: string) =>
	value.trim() === "" ? undefined : Number(value);

/**
 * Add / edit a curriculum section. Conditionally mounted by the page (always
 * open while rendered, like ConfirmDialog). Owns its create/update mutation and
 * invalidates the parent course detail at the call site.
 */
const SectionDialog = ({ courseId, section, onClose }: SectionDialogProps) => {
	const isEdit = !!section;
	const queryClient = useQueryClient();

	const { mutate: create, isPending: creating } = useCreateSection();
	const { mutate: update, isPending: updating } = useUpdateSection();

	const {
		register,
		handleSubmit,
		trigger,
		formState: { errors, isValid },
	} = useForm<SectionFormData>({
		mode: "onChange",
		resolver: zodResolver(sectionFormSchema),
		defaultValues: {
			title: section?.title ?? "",
			order: section ? String(section.order) : "",
		},
	});

	// Edit mode: validate the prefilled values so Save enables without a field
	// change (create mode stays invalid until the title is typed).
	useEffect(() => {
		if (section) void trigger();
	}, [section, trigger]);

	const done = (message: string) => {
		queryClient.invalidateQueries({ queryKey: courseKey(courseId) });
		toast.success(message);
		onClose();
	};

	const onSubmit = (values: SectionFormData) => {
		const payload = { title: values.title, order: toOrder(values.order) };
		if (section) {
			update(
				{ id: section._id, payload },
				{
					onSuccess: () => done("Section updated"),
					onError: (err) => toast.error(err.message),
				},
			);
		} else {
			create(
				{ courseId, payload },
				{
					onSuccess: () => done("Section added"),
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
					<DialogTitle>{isEdit ? "Edit section" : "Add section"}</DialogTitle>
					<DialogDescription>
						Sections group related lessons within a course.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					className="space-y-4"
				>
					<FormField
						label="Section title"
						id="section-title"
						placeholder="e.g. Getting Started"
						error={errors.title?.message}
						{...register("title")}
					/>

					<FormField
						label="Order"
						id="section-order"
						inputMode="numeric"
						placeholder="0"
						hint="Optional: leave blank to append"
						error={errors.order?.message}
						{...register("order")}
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
							{isEdit ? "Save changes" : "Add section"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default SectionDialog;

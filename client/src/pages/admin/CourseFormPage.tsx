//* src/pages/admin/CourseFormPage.tsx

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import FormField from "@/components/form/FormField";
import FormTextarea from "@/components/form/FormTextarea";
import StatusSegment from "@/components/StatusSegment";
import CourseFormLoadFailed from "@/components/admin/CourseFormLoadFailed";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import {
	useGetCourse,
	useCreateCourse,
	useUpdateCourse,
} from "@/hooks/useCourses";
import { courseFormSchema, type CourseFormData } from "@/schemas/course.schema";
import { rupeesToPaise, paiseToRupees } from "@/lib/currency";
import { COURSES_KEY, courseKey } from "@/lib/queryKeys";
import ROUTES from "@/routes/paths";
import type { CreateCoursePayload } from "@/types/course.types";

/** Mirror of the server's slug rule — preview only; the server is the source of truth. */
const slugify = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

const CourseFormPage = () => {
	const { id } = useParams();
	const isEdit = !!id;
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const {
		data: existing,
		isLoading: courseLoading,
		isError: courseLoadError,
		refetch,
	} = useGetCourse(id ?? "");
	const { mutate: create, isPending: creating } = useCreateCourse();
	const { mutate: update, isPending: updating } = useUpdateCourse();

	const {
		register,
		handleSubmit,
		control,
		setValue,
		reset,
		trigger,
		formState: { errors, isValid },
	} = useForm<CourseFormData>({
		mode: "onChange",
		resolver: zodResolver(courseFormSchema),
		defaultValues: {
			title: "",
			description: "",
			instructorName: "",
			thumbnailUrl: "",
			priceRupees: "",
			isPublished: false,
		},
	});

	// Prefill exactly once, the first time the course loads in edit mode — a
	// guard so a later refetch can never clobber in-progress edits.
	const prefilled = useRef(false);
	useEffect(() => {
		const course = existing?.data;
		if (!course || prefilled.current) return;
		prefilled.current = true;
		reset({
			title: course.title,
			description: course.description,
			instructorName: course.instructorName,
			thumbnailUrl: course.thumbnailUrl,
			priceRupees: String(paiseToRupees(course.price)),
			isPublished: course.isPublished,
		});
		void trigger(); // revalidate so isValid reflects the prefilled course
	}, [existing, reset, trigger]);

	const title = useWatch({ control, name: "title" });
	const isPublished = useWatch({ control, name: "isPublished" });

	if (isEdit && courseLoading) return <Loader className="min-h-[60vh]" />;
	if (isEdit && courseLoadError)
		return <CourseFormLoadFailed onRetry={() => refetch()} />;

	const onSubmit = (values: CourseFormData) => {
		const payload: CreateCoursePayload = {
			title: values.title,
			description: values.description,
			instructorName: values.instructorName,
			thumbnailUrl: values.thumbnailUrl,
			price: rupeesToPaise(Number(values.priceRupees)),
			isPublished: values.isPublished,
		};

		if (isEdit && id) {
			update(
				{ id, payload },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: COURSES_KEY });
						queryClient.invalidateQueries({ queryKey: courseKey(id) });
						toast.success("Course updated");
						navigate(ROUTES.ADMIN_COURSES);
					},
					onError: (err) => toast.error(err.message),
				},
			);
		} else {
			create(payload, {
				onSuccess: (res) => {
					queryClient.invalidateQueries({ queryKey: COURSES_KEY });
					toast.success("Course created");
					navigate(ROUTES.adminCourseEdit(res.data._id));
				},
				onError: (err) => toast.error(err.message),
			});
		}
	};

	const pending = creating || updating;

	return (
		<section>
			<div className="mb-2 font-mono text-xs text-muted-foreground">
				<Link to={ROUTES.ADMIN_COURSES} className="hover:text-foreground">
					Courses
				</Link>
				{" / "}
				{isEdit ? title || "Edit course" : "New course"}
			</div>
			<h1 className="mb-6 font-heading text-3xl font-semibold">
				{isEdit ? "Edit course" : "New course"}
			</h1>

			<form
				onSubmit={handleSubmit(onSubmit)}
				noValidate
				className="max-w-3xl rounded-xl border border-border bg-card p-7"
			>
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<div className="sm:col-span-2">
						<FormField
							label="Title"
							id="title"
							placeholder="e.g. React from Scratch"
							error={errors.title?.message}
							{...register("title")}
						/>
						<p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
							slug → {title ? slugify(title) : "…"}
						</p>
					</div>

					<div className="sm:col-span-2">
						<FormTextarea
							label="Description"
							id="description"
							placeholder="What will students learn?"
							error={errors.description?.message}
							{...register("description")}
						/>
					</div>

					<FormField
						label="Instructor"
						id="instructorName"
						placeholder="Instructor name"
						error={errors.instructorName?.message}
						{...register("instructorName")}
					/>

					<FormField
						label="Price (₹)"
						id="priceRupees"
						inputMode="numeric"
						placeholder="0"
						prefix="₹"
						className="font-mono"
						hint="Whole rupees — stored as paise (₹999 → 99900)"
						error={errors.priceRupees?.message}
						{...register("priceRupees")}
					/>

					<div className="sm:col-span-2">
						<FormField
							label="Thumbnail URL"
							id="thumbnailUrl"
							placeholder="https://…"
							error={errors.thumbnailUrl?.message}
							{...register("thumbnailUrl")}
						/>
					</div>

					<div className="sm:col-span-2">
						<FormField
							label="Trailer key"
							id="trailerKey"
							disabled
							placeholder="courses/react/trailer.mp4"
							className="font-mono"
							labelExtra={
								<span className="font-mono text-[11px] font-normal text-muted-foreground">
									optional · uploaded in Phase 4
								</span>
							}
						/>
					</div>

					<StatusSegment
						value={isPublished}
						onChange={(value) =>
							setValue("isPublished", value, { shouldValidate: true })
						}
					/>
				</div>

				<div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
					<Button
						type="button"
						variant="outline"
						size="lg"
						className="font-mono"
						onClick={() => navigate(ROUTES.ADMIN_COURSES)}
					>
						Cancel
					</Button>

					<Button
						type="submit"
						size="lg"
						className="font-mono"
						disabled={pending || !isValid}
					>
						{isEdit ? "Save changes" : "Create course"}
					</Button>
				</div>
			</form>

			{isEdit && id && (
				<div className="mt-3.5 max-w-3xl">
					<Button
						variant="outline"
						size="lg"
						className="font-mono"
						onClick={() => navigate(ROUTES.adminCourseCurriculum(id))}
					>
						Edit curriculum →
					</Button>
				</div>
			)}
		</section>
	);
};

export default CourseFormPage;

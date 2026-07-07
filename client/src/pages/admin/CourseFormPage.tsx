//* src/pages/admin/CourseFormPage.tsx

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import VideoUploadField from "@/components/admin/VideoUploadField";
import FormField from "@/components/form/FormField";
import FormTextarea from "@/components/form/FormTextarea";
import StatusSegment from "@/components/StatusSegment";
import LoadFailed from "@/components/common/LoadFailed";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

import {
	useGetCourse,
	useCreateCourse,
	useUpdateCourse,
} from "@/hooks/useCourses";
import { useVideoUpload } from "@/hooks/useVideoUpload";

import ROUTES from "@/routes/paths";
import type { CreateCoursePayload } from "@/types/course.types";
import {
	courseFormSchema,
	parseLearningOutcomes,
	type CourseFormData,
} from "@/schemas/course.schema";

import { rupeesToPaise, paiseToRupees } from "@/lib/currency";
import { COURSES_KEY, courseKey } from "@/lib/queryKeys";

import {
	createCourseTrailerUploadUrl,
	setCourseTrailer,
} from "@/api/media.api";

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

	// Trailer upload (edit mode only — a course id must exist to mint an upload URL).
	const trailerUpload = useVideoUpload({
		mint: () => createCourseTrailerUploadUrl(id ?? "").then((res) => res.data),
		confirm: () => setCourseTrailer(id ?? ""),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: courseKey(id ?? "") });
			toast.success("Trailer uploaded");
		},
		onError: (message) => toast.error(message),
	});

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
			category: "",
			learningOutcomesText: "",
		},
	});

	// Prefill once per loaded course — keyed by id (not a one-shot flag) so
	// switching the :id param re-hydrates the form, while a refetch of the same
	// course never clobbers in-progress edits.
	const prefilledId = useRef<string | null>(null);
	useEffect(() => {
		const course = existing?.data;
		if (!course || prefilledId.current === course._id) return;
		prefilledId.current = course._id;

		reset({
			title: course.title,
			description: course.description,
			instructorName: course.instructorName,
			thumbnailUrl: course.thumbnailUrl,
			priceRupees: String(paiseToRupees(course.price)),
			isPublished: course.isPublished,
			category: course.category ?? "",
			learningOutcomesText: (course.learningOutcomes ?? []).join("\n"),
		});
		void trigger(); // revalidate so isValid reflects the prefilled course
	}, [existing, reset, trigger]);

	const title = useWatch({ control, name: "title" });
	const isPublished = useWatch({ control, name: "isPublished" });

	if (isEdit && courseLoading) return <Loader className="min-h-[60vh]" />;
	if (isEdit && courseLoadError)
		return (
			<LoadFailed
				title="Couldn't load this course"
				description="It may have been removed, or something went wrong. Try again or go back to courses."
				onRetry={() => refetch()}
				backTo={ROUTES.ADMIN_COURSES}
				backLabel="Back to courses"
			/>
		);

	const onSubmit = (values: CourseFormData) => {
		// Outcomes always sent (empty [] clears); category omitted when blank (server rejects "").
		const learningOutcomes = parseLearningOutcomes(
			values.learningOutcomesText ?? "",
		);

		const category = values.category?.trim();

		const payload: CreateCoursePayload = {
			title: values.title,
			description: values.description,
			instructorName: values.instructorName,
			thumbnailUrl: values.thumbnailUrl,
			price: rupeesToPaise(Number(values.priceRupees)),
			isPublished: values.isPublished,
			learningOutcomes,
			...(category ? { category } : {}),
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

					<div className="sm:col-span-2">
						<FormField
							label="Category"
							id="category"
							placeholder="e.g. Web Development"
							hint="Optional — up to 60 characters"
							error={errors.category?.message}
							{...register("category")}
						/>
					</div>

					<div className="sm:col-span-2">
						<FormTextarea
							label="Learning outcomes"
							id="learningOutcomesText"
							placeholder="What will students be able to do?"
							hint="One outcome per line, up to 12"
							error={errors.learningOutcomesText?.message}
							{...register("learningOutcomesText")}
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

					{isEdit && id && (
						<div className="sm:col-span-2">
							<VideoUploadField
								label="Trailer"
								state={trailerUpload}
								hasVideo={!!existing?.data.trailerKey}
							/>
						</div>
					)}

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
						disabled={pending || !isValid || trailerUpload.isBusy}
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

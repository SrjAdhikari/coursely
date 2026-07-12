//* src/pages/admin/CourseFormPage.tsx

import { Link, useNavigate, useParams } from "react-router";

import FormField from "@/components/form/FormField";
import FormTextarea from "@/components/form/FormTextarea";
import StatusSegment from "@/components/StatusSegment";
import LoadFailed from "@/components/common/LoadFailed";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";

import useCourseForm from "@/hooks/useCourseForm";
import ROUTES from "@/routes/paths";

/** Mirror of the server's slug rule — preview only; the server is the source of truth. */
const slugify = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

const CourseFormPage = () => {
	const navigate = useNavigate();
	const { id } = useParams();

	const {
		isEdit,
		isLoading,
		isError,
		refetch,
		register,
		errors,
		isValid,
		title,
		isPublished,
		setPublished,
		pending,
		submitForm,
	} = useCourseForm(id);

	if (isLoading) return <Loader className="min-h-[60vh]" />;
	if (isError)
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
				onSubmit={submitForm}
				noValidate
				className="max-w-3xl rounded-xl border border-border bg-card p-7"
			>
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<div className="sm:col-span-2">
						<FormField
							label="Title"
							id="title"
							placeholder="e.g. React from Scratch"
							autoComplete="off"
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
							autoComplete="off"
							hint="Required: up to 60 characters"
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
						autoComplete="off"
						error={errors.instructorName?.message}
						{...register("instructorName")}
					/>

					<FormField
						label="Price (₹)"
						id="priceRupees"
						inputMode="numeric"
						placeholder="0"
						autoComplete="off"
						prefix="₹"
						className="font-mono"
						hint="Whole rupees: stored as paise (₹999 → 99900)"
						error={errors.priceRupees?.message}
						{...register("priceRupees")}
					/>

					<StatusSegment value={isPublished} onChange={setPublished} />
				</div>

				<div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
					{isEdit && (
						<Button
							type="button"
							variant="outline"
							size="lg"
							className="font-mono"
							onClick={() => id && navigate(ROUTES.adminCourseCurriculum(id))}
						>
							Manage content
						</Button>
					)}

					<div className="ml-auto flex gap-3">
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
							className="font-mono disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
							disabled={pending || !isValid}
						>
							{isEdit ? "Save changes" : "Create course"}
						</Button>
					</div>
				</div>
			</form>
		</section>
	);
};

export default CourseFormPage;

//* src/hooks/useCourseForm.ts

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	useGetCourse,
	useCreateCourse,
	useUpdateCourse,
} from "@/hooks/useCourses";

import ROUTES from "@/routes/paths";
import {
	courseFormSchema,
	buildCoursePayload,
	type CourseFormData,
} from "@/schemas/course.schema";

import { paiseToRupees } from "@/lib/currency";
import { COURSES_KEY, courseKey } from "@/lib/queryKeys";

/** Data + form state for the admin course create/edit page. */
const useCourseForm = (id?: string) => {
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

	const submitCourse = (values: CourseFormData) => {
		const payload = buildCoursePayload(values);

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
					navigate(ROUTES.adminCourseCurriculum(res.data._id));
				},
				onError: (err) => toast.error(err.message),
			});
		}
	};

	return {
		isEdit,
		isLoading: isEdit && courseLoading,
		isError: isEdit && courseLoadError,
		refetch,
		register,
		errors,
		isValid,
		title,
		isPublished,
		setPublished: (value: boolean) =>
			setValue("isPublished", value, { shouldValidate: true }),
		pending: creating || updating,
		submitForm: handleSubmit(submitCourse),
	};
};

export default useCourseForm;

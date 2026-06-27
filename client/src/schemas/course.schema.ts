//* src/schemas/course.schema.ts

import { z } from "zod";

/**
 * Course create/edit form. `priceRupees` is a required whole-rupee digit string
 * (converted to integer paise on submit). `isPublished` drives the Draft/Live segment.
 */
const courseFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, "Title must be at least 3 characters")
		.max(200, "Title must be at most 200 characters"),

	description: z.string().trim().min(1, "Description is required"),
	instructorName: z.string().trim().min(1, "Instructor name is required"),

	thumbnailUrl: z.url({
		protocol: /^https?$/,
		error: "Enter a valid http(s) URL",
	}),

	priceRupees: z
		.string()
		.trim()
		.regex(/^\d+$/, "Enter the price in whole rupees"),

	isPublished: z.boolean(),
});

/** Inferred type from the schema — use this as the form type. */
type CourseFormData = z.infer<typeof courseFormSchema>;

export type { CourseFormData };
export { courseFormSchema };

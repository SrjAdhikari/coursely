//* src/schemas/course.schema.ts

import { z } from "zod";

// Cap mirrors the server validator (it also rejects >12).
const MAX_LEARNING_OUTCOMES = 12;

// One outcome per line → trimmed string[], blanks dropped; shared by the cap + submit.
const parseLearningOutcomes = (raw: string): string[] =>
	raw
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

/**
 * Course create/edit form. `priceRupees` is a whole-rupee digit string (→ paise on
 * submit); `learningOutcomesText` is one outcome per line (→ string[] on submit).
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

	category: z
		.string()
		.trim()
		.max(60, "Category must be at most 60 characters")
		.optional(),

	learningOutcomesText: z
		.string()
		.refine(
			(raw) => parseLearningOutcomes(raw).length <= MAX_LEARNING_OUTCOMES,
			`Add at most ${MAX_LEARNING_OUTCOMES} learning outcomes`,
		)
		.optional(),
});

/** Inferred type from the schema — use this as the form type. */
type CourseFormData = z.infer<typeof courseFormSchema>;

export type { CourseFormData };
export { courseFormSchema, parseLearningOutcomes };

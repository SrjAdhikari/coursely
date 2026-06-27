//* src/schemas/lesson.schema.ts

import { z } from "zod";

/**
 * Lesson modal form. `order`/`duration` are optional digit strings (blank = default).
 */
const lessonFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Lesson title is required")
		.max(200, "Title must be at most 200 characters"),

	order: z.string().trim().regex(/^\d*$/, "Order must be a whole number"),
	duration: z.string().trim().regex(/^\d*$/, "Duration must be whole seconds"),
	isPreview: z.boolean(),
});

/** Inferred type from the schema — use this as the form type. */
type LessonFormData = z.infer<typeof lessonFormSchema>;

export type { LessonFormData };
export { lessonFormSchema };

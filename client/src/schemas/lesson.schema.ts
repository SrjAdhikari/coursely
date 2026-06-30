//* src/schemas/lesson.schema.ts

import { z } from "zod";

/**
 * Lesson dialog form. `order` is an optional digit string (blank = default).
 * Duration is NOT here — it is set automatically by the video upload.
 */
const lessonFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Lesson title is required")
		.max(200, "Title must be at most 200 characters"),

	order: z.string().trim().regex(/^\d*$/, "Order must be a whole number"),
	isPreview: z.boolean(),
});

/** Inferred type from the schema — use this as the form type. */
type LessonFormData = z.infer<typeof lessonFormSchema>;

export type { LessonFormData };
export { lessonFormSchema };

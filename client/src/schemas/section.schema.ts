//* src/schemas/section.schema.ts

import { z } from "zod";

/** 
 * Section dialog form. `order` is an optional digit string (blank = default 0).
 */
const sectionFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Section title is required")
		.max(200, "Title must be at most 200 characters"),

	order: z.string().trim().regex(/^\d*$/, "Order must be a whole number"),
});

/** Inferred type from the schema — use this as the form type. */
type SectionFormData = z.infer<typeof sectionFormSchema>;

export type { SectionFormData };
export { sectionFormSchema };

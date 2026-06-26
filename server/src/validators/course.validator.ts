//* src/validators/course.validator.ts

import { z } from "zod";

/**
 * No-default field rules. Create layers defaults on top; update = pure `.partial()`
 * of these, so an empty patch is rejectable and a patch never clobbers unsent fields.
 */
const courseShape = {
	title: z
		.string()
		.trim()
		.min(3, "Title must be at least 3 characters")
		.max(200, "Title must be at most 200 characters"),
	description: z.string().trim().min(1, "Description is required"),
	instructorName: z.string().trim().min(1, "Instructor name is required"),
	thumbnailUrl: z.url("Thumbnail must be a valid URL"),
	price: z
		.number()
		.int("Price must be an integer (paise)")
		.min(0, "Price cannot be negative"),
	currency: z.enum(["INR"]),
	isPublished: z.boolean(),
};

const sectionShape = {
	title: z
		.string()
		.trim()
		.min(1, "Section title is required")
		.max(200, "Section title must be at most 200 characters"),
	order: z
		.number()
		.int("Order must be an integer")
		.min(0, "Order cannot be negative"),
};

const lessonShape = {
	title: z
		.string()
		.trim()
		.min(1, "Lesson title is required")
		.max(200, "Lesson title must be at most 200 characters"),
	order: z
		.number()
		.int("Order must be an integer")
		.min(0, "Order cannot be negative"),
	isPreview: z.boolean(),
	duration: z
		.number()
		.int("Duration must be an integer (seconds)")
		.min(0, "Duration cannot be negative"),
};

const UPDATE_REFINE = { message: "Provide at least one field to update" };

const createCourseSchema = z.object({
	...courseShape,
	currency: courseShape.currency.default("INR"),
	isPublished: courseShape.isPublished.default(false),
});

const updateCourseSchema = z
	.object(courseShape)
	.partial()
	.refine((data) => Object.keys(data).length > 0, UPDATE_REFINE);

const createSectionSchema = z.object({
	...sectionShape,
	order: sectionShape.order.default(0),
});

const updateSectionSchema = z
	.object(sectionShape)
	.partial()
	.refine((data) => Object.keys(data).length > 0, UPDATE_REFINE);

const createLessonSchema = z.object({
	...lessonShape,
	order: lessonShape.order.default(0),
	isPreview: lessonShape.isPreview.default(false),
	duration: lessonShape.duration.default(0),
});

const updateLessonSchema = z
	.object(lessonShape)
	.partial()
	.refine((data) => Object.keys(data).length > 0, UPDATE_REFINE);

type CreateCourseInput = z.infer<typeof createCourseSchema>;
type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
type CreateSectionInput = z.infer<typeof createSectionSchema>;
type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
type CreateLessonInput = z.infer<typeof createLessonSchema>;
type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export {
	createCourseSchema,
	updateCourseSchema,
	createSectionSchema,
	updateSectionSchema,
	createLessonSchema,
	updateLessonSchema,
};

export type {
	CreateCourseInput,
	UpdateCourseInput,
	CreateSectionInput,
	UpdateSectionInput,
	CreateLessonInput,
	UpdateLessonInput,
};

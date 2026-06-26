//* src/validators/course.validator.ts

import { z } from "zod";

// currency/isPublished/order/isPreview/duration default at the model layer, so
// they stay optional here and update = a plain `.partial()` that can't clobber.

const createCourseSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, "Title must be at least 3 characters")
		.max(200, "Title must be at most 200 characters"),
	description: z.string().trim().min(1, "Description is required"),
	instructorName: z.string().trim().min(1, "Instructor name is required"),
	thumbnailUrl: z.url({
		protocol: /^https?$/,
		error: "Thumbnail must be a valid http(s) URL",
	}),
	price: z
		.number()
		.int("Price must be an integer (paise)")
		.min(0, "Price cannot be negative"),
	currency: z.enum(["INR"]).optional(),
	isPublished: z.boolean().optional(),
});

const updateCourseSchema = createCourseSchema
	.partial()
	.refine((data) => Object.keys(data).length > 0, {
		message: "Provide at least one field to update",
	});

const createSectionSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Section title is required")
		.max(200, "Section title must be at most 200 characters"),
	order: z
		.number()
		.int("Order must be an integer")
		.min(0, "Order cannot be negative")
		.optional(),
});

const updateSectionSchema = createSectionSchema
	.partial()
	.refine((data) => Object.keys(data).length > 0, {
		message: "Provide at least one field to update",
	});

const createLessonSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Lesson title is required")
		.max(200, "Lesson title must be at most 200 characters"),
	order: z
		.number()
		.int("Order must be an integer")
		.min(0, "Order cannot be negative")
		.optional(),
	isPreview: z.boolean().optional(),
	duration: z
		.number()
		.int("Duration must be an integer (seconds)")
		.min(0, "Duration cannot be negative")
		.optional(),
});

const updateLessonSchema = createLessonSchema
	.partial()
	.refine((data) => Object.keys(data).length > 0, {
		message: "Provide at least one field to update",
	});

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

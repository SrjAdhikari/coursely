//* src/models/course.model.ts

import { Schema, model, type Types } from "mongoose";
import { slugify } from "../utils/slug";

export interface CourseDocument {
	_id: Types.ObjectId;
	title: string;
	slug: string;
	description: string;
	instructorName: string;
	thumbnailUrl: string;
	trailerKey?: string;
	price: number;
	currency: string;
	isPublished: boolean;
	category?: string;
	learningOutcomes: string[];
	createdAt: Date;
	updatedAt: Date;
}

const courseSchema = new Schema<CourseDocument>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			// Normalize every write through slugify so a non-URL-safe slug can
			// never be persisted, whatever the write path (slugify lowercases
			// and trims, so those casters are redundant here).
			set: slugify,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		instructorName: {
			type: String,
			required: true,
			trim: true,
		},
		thumbnailUrl: {
			type: String,
			required: true,
			trim: true,
		},
		trailerKey: {
			type: String,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		currency: {
			type: String,
			default: "INR",
		},
		isPublished: {
			type: Boolean,
			default: false,
		},
		category: {
			type: String,
			trim: true,
		},
		learningOutcomes: {
			type: [String],
			default: [],
		},
	},
	{ strict: "throw", timestamps: true },
);

// Full-text search over the public-facing course fields (FR-2).
courseSchema.index({
	title: "text",
	description: "text",
	instructorName: "text",
});

const Course = model<CourseDocument>("Course", courseSchema);
export default Course;

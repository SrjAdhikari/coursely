//* src/models/section.model.ts

import { Schema, model, type Types } from "mongoose";

export interface SectionDocument {
	_id: Types.ObjectId;
	courseId: Types.ObjectId;
	title: string;
	order: number;
}

const sectionSchema = new Schema<SectionDocument>(
	{
		courseId: {
			type: Schema.Types.ObjectId,
			ref: "Course",
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		order: {
			type: Number,
			default: 0,
		},
	},
	{ strict: "throw" },
);

const Section = model<SectionDocument>("Section", sectionSchema);
export default Section;

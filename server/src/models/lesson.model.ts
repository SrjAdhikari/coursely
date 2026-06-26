//* src/models/lesson.model.ts

import { Schema, model, type Types } from "mongoose";

export interface LessonDocument {
	_id: Types.ObjectId;
	sectionId: Types.ObjectId;
	courseId: Types.ObjectId; // denormalized — avoids lesson→section→course lookups
	title: string;
	order: number;
	isPreview: boolean;
	videoKey?: string; // set in Phase 4 after the R2 upload
	duration: number; // seconds; set with the video in Phase 4
}

const lessonSchema = new Schema<LessonDocument>(
	{
		sectionId: {
			type: Schema.Types.ObjectId,
			ref: "Section",
			required: true,
			index: true,
		},
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
		isPreview: {
			type: Boolean,
			default: false,
		},
		videoKey: {
			type: String,
		},
		duration: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{ strict: "throw" },
);

const Lesson = model<LessonDocument>("Lesson", lessonSchema);
export default Lesson;

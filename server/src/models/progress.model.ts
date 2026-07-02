//* src/models/progress.model.ts

import { Schema, model, type Types } from "mongoose";

export interface ProgressDocument {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	lessonId: Types.ObjectId;
	// Denormalized from the lesson, set server-side (never client-supplied) so it
	// cannot drift — powers the {userId,courseId} per-course read.
	courseId: Types.ObjectId;
	positionSeconds: number;
	completed: boolean;
	completedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const progressSchema = new Schema<ProgressDocument>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		lessonId: {
			type: Schema.Types.ObjectId,
			ref: "Lesson",
			required: true,
		},
		courseId: {
			type: Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		positionSeconds: {
			type: Number,
			default: 0,
			min: 0,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		completedAt: {
			type: Date,
		},
	},
	{ strict: "throw", timestamps: true },
);

// One row per user+lesson — the upsert target.
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

// The per-course read (GET /api/progress/course/:courseId).
progressSchema.index({ userId: 1, courseId: 1 });

const Progress = model<ProgressDocument>("Progress", progressSchema);
export default Progress;

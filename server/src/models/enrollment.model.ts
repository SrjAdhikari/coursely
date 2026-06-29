//* src/models/enrollment.model.ts

import { Schema, model, type Types } from "mongoose";

export interface EnrollmentDocument {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	courseId: Types.ObjectId;
	// Payment fields are written by the Stripe webhook in a later release.
	stripeSessionId?: string;
	amountPaid?: number;
	currency?: string;
	createdAt: Date;
}

const enrollmentSchema = new Schema<EnrollmentDocument>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		courseId: {
			type: Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		stripeSessionId: {
			type: String,
		},
		amountPaid: {
			type: Number,
			min: 0,
		},
		currency: {
			type: String,
		},
	},
	{ strict: "throw", timestamps: { createdAt: true, updatedAt: false } },
);

// One enrollment per user+course — duplicate enrollment is physically impossible,
// which also makes the payment webhook idempotent under at-least-once retries.
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Enrollment = model<EnrollmentDocument>("Enrollment", enrollmentSchema);
export default Enrollment;

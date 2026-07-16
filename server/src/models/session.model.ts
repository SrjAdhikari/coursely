//* src/models/session.model.ts

import { Schema, model, type Types } from "mongoose";
import { sevenDaysFromNow } from "../utils/date";

export interface SessionDocument {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	tokenHash: string;
	expiresAt: Date;
	createdAt: Date;
}

const sessionSchema = new Schema<SessionDocument>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		tokenHash: {
			type: String,
			required: true,
			unique: true,
		},
		createdAt: {
			type: Date,
			required: true,
			default: Date.now,
		},
		expiresAt: {
			type: Date,
			required: true,
			default: sevenDaysFromNow,
		},
	},
	{ strict: "throw" },
);

// Index for automatic session expiration (MongoDB will automatically delete expired sessions).
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = model<SessionDocument>("Session", sessionSchema);
export default Session;

//* src/models/token.model.ts

import { Schema, model, type Types } from "mongoose";

export type TokenType = "email_verification" | "password_reset";

export interface TokenDocument {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	tokenHash: string;
	type: TokenType;
	expiresAt: Date;
	createdAt: Date;
}

const tokenSchema = new Schema<TokenDocument>(
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
		type: {
			type: String,
			enum: ["email_verification", "password_reset"],
			required: true,
		},
		createdAt: {
			type: Date,
			required: true,
			default: Date.now,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{ strict: "throw" },
);

// Index for automatic token expiration
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = model<TokenDocument>("Token", tokenSchema);
export default Token;

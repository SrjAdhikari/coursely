//* src/models/user.model.ts

import { Schema, model, type Types, type Model } from "mongoose";
import { hash, compare } from "bcryptjs";

export type UserRole = "student" | "admin";

export interface UserDocument {
	_id: Types.ObjectId;
	name: string;
	email: string;
	password: string;
	role: UserRole;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserMethods {
	comparePassword(userPassword: string): Promise<boolean>;
}

type UserModel = Model<UserDocument, Record<string, never>, UserMethods>;

/** The public-safe user shape (no password; `_id` → `id`). */
export interface PublicUser {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

const userSchema = new Schema<UserDocument, UserModel, UserMethods>(
	{
		name: { type: String, required: true, trim: true, maxlength: 100 },
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
			match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
		},
		password: { type: String, required: true, minlength: 8, select: false },
		role: { type: String, enum: ["student", "admin"], default: "student" },
		isActive: { type: Boolean, default: true },
	},
	{ strict: "throw", timestamps: true },
);

// Hash the password before saving — only when it changed.
userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	this.password = await hash(this.password, 10);
});

// Verify a plaintext password against the stored hash.
userSchema.methods.comparePassword = function (
	userPassword: string,
): Promise<boolean> {
	if (!this.password) return Promise.resolve(false);
	return compare(userPassword, this.password);
};

export const toPublicUser = (
	user: Pick<UserDocument, "_id" | "name" | "email" | "role">,
): PublicUser => ({
	id: user._id.toString(),
	name: user.name,
	email: user.email,
	role: user.role,
});

const User = model<UserDocument, UserModel>("User", userSchema);

export default User;

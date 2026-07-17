//* src/models/user.model.ts

import { Schema, model, type Types, type Model } from "mongoose";
import { hash, compare, genSalt } from "bcryptjs";

export type UserRole = "student" | "admin";

export interface UserDocument {
	_id: Types.ObjectId;
	name: string;
	email: string;
	password?: string;
	provider: "email" | "google";
	avatarUrl?: string;
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
	avatarUrl?: string;
}

const NAME_PATTERN = /^\p{L}[\p{L}\p{M}]*(?:[ '-]\p{L}[\p{L}\p{M}]*)*$/u;
const userSchema = new Schema<UserDocument, UserModel, UserMethods>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 50,
			validate: {
				validator(value: string) {
					if ((this as unknown as UserDocument).provider !== "email")
						return true;
					return value.length >= 3 && NAME_PATTERN.test(value);
				},
				message: "Name must be 3-50 letters, spaces, hyphens, or apostrophes",
			},
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
			match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		},
		password: {
			type: String,
			required: function (this: UserDocument) {
				return this.provider === "email";
			},
			minlength: 8,
			select: false,
		},
		provider: {
			type: String,
			enum: ["email", "google"],
			default: "email",
		},
		avatarUrl: { type: String },
		role: { type: String, enum: ["student", "admin"], default: "student" },
		isActive: { type: Boolean, default: true },
	},
	{ strict: "throw", timestamps: true },
);

// Hash the password before saving — only when it changed.
userSchema.pre("save", async function () {
	if (!this.isModified("password") || !this.password) return;

	const salt = await genSalt(10);
	this.password = await hash(this.password, salt);
});

// Verify a plaintext password against the stored hash.
userSchema.methods.comparePassword = function (
	userPassword: string,
): Promise<boolean> {
	if (!this.password) return Promise.resolve(false);
	return compare(userPassword, this.password);
};

export const toPublicUser = (
	user: Pick<UserDocument, "_id" | "name" | "email" | "role" | "avatarUrl">,
): PublicUser => ({
	id: user._id.toString(),
	name: user.name,
	email: user.email,
	role: user.role,
	avatarUrl: user.avatarUrl,
});

const User = model<UserDocument, UserModel>("User", userSchema);

export default User;

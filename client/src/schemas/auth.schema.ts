//* src/schemas/auth.schema.ts

import { z } from "zod";

const nameRule = /^\p{L}[\p{L}\p{M}]*(?:[ '-]\p{L}[\p{L}\p{M}]*)*$/u;

/** Shared strong-password rule - reused by register and password-reset. */
const passwordRule = z
	.string()
	.trim()
	.min(8, "Password must be at least 8 characters")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

/** Validation schema for the register form. */
const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, "Name must be at least 3 characters")
		.max(50, "Name must be at most 50 characters")
		.regex(
			nameRule,
			"Name must start with a letter and contain only letters, spaces, hyphens, and apostrophes",
		),

	email: z.email("Please enter a valid email address"),
	password: passwordRule,
});

/** Validation schema for the login form. */
const loginSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().trim().nonempty("Password is required"),
});

/** Validation schema for the forgot-password form (email only). */
const forgotPasswordSchema = z.object({
	email: z.email("Please enter a valid email address"),
});

/**
 * Validation schema for the reset-password form (new password + confirmation).
 * The `refine` method ensures that the two password fields match.
 */
const resetPasswordSchema = z
	.object({
		newPassword: passwordRule,
		confirmPassword: z.string().trim().nonempty("Please confirm your password"),
	})
	.refine((values) => values.newPassword === values.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

/** Inferred types from schemas — use these as the form types. */
type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export type {
	RegisterFormData,
	LoginFormData,
	ForgotPasswordFormData,
	ResetPasswordFormData,
};
export { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };

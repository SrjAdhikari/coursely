//* src/schemas/auth.schema.ts

import { z } from "zod";

const nameRule = /^\p{L}[\p{L}\p{M}]*(?:[ '-]\p{L}[\p{L}\p{M}]*)*$/u;

/**
 * Validation schema for the register form.
 */
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

	password: z
		.string()
		.trim()
		.min(8, "Password must be at least 8 characters")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[0-9]/, "Password must contain at least one number")
		.regex(
			/[^a-zA-Z0-9]/,
			"Password must contain at least one special character",
		),
});

/**
 * Validation schema for the login form.
 */
const loginSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().trim().nonempty("Password is required"),
});

/** Inferred types from schemas — use these as the form types. */
type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export type { RegisterFormData, LoginFormData };
export { registerSchema, loginSchema };

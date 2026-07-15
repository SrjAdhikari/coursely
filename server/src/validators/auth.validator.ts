//* src/validators/auth.validator.ts

import { z } from "zod";
import sanitizeInput from "../utils/sanitizeInput";

const nameRegex = /^\p{L}[\p{L}\p{M}]*(?:[ '-]\p{L}[\p{L}\p{M}]*)*$/u;
const name = z
	.string()
	.trim()
	.transform(sanitizeInput)
	.refine(
		(value) => value.length >= 3 && value.length <= 50,
		"Name must be between 3 and 50 characters",
	)
	.refine(
		(value) => nameRegex.test(value),
		"Name must start with a letter and contain only letters, spaces, hyphens, and apostrophes",
	);

const email = z
	.string()
	.trim()
	.toLowerCase()
	.pipe(z.email("Please enter a valid email address"));

const password = z
	.string()
	.trim()
	.min(8, "Password must be at least 8 characters")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must contain at least one special character",
	);

const registerSchema = z.object({
	name,
	email,
	password,
});

const loginSchema = z.object({
	email,
	password: z.string().trim().nonempty("Password is required"),
});

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export { registerSchema, loginSchema };
export type { RegisterInput, LoginInput };

//* test/schemas/auth.schema.test.ts

import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";

describe("client auth schemas", () => {
	describe("loginSchema", () => {
		it("rejects an invalid email", () => {
			expect(
				loginSchema.safeParse({ email: "nope", password: "x" }).success,
			).toBe(false);
		});

		it("accepts a valid email with any non-empty password", () => {
			expect(
				loginSchema.safeParse({ email: "asha@example.com", password: "x" })
					.success,
			).toBe(true);
		});

		it("rejects an empty password", () => {
			expect(
				loginSchema.safeParse({ email: "asha@example.com", password: "" })
					.success,
			).toBe(false);
		});
	});

	describe("registerSchema", () => {
		it("rejects a password missing an uppercase letter, number, and special character", () => {
			expect(
				registerSchema.safeParse({
					name: "Asha",
					email: "asha@example.com",
					password: "alllowercase",
				}).success,
			).toBe(false);
		});

		it("accepts a strong password (8+ chars, mixed case, number, special)", () => {
			expect(
				registerSchema.safeParse({
					name: "Asha",
					email: "asha@example.com",
					password: "Password1!",
				}).success,
			).toBe(true);
		});

		it("rejects a name shorter than 3 characters", () => {
			expect(
				registerSchema.safeParse({
					name: "Al",
					email: "asha@example.com",
					password: "Password1!",
				}).success,
			).toBe(false);
		});
	});
});

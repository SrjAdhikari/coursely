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

		it.each([
			["all digits", "12313213"],
			["punctuation only", "..."],
			["an email address", "peyij91811@duvips.com"],
			["digits mixed with letters", "user9251813"],
			["a name containing a period", "John A. Smith"],
			["a name with a double space", "Mary  Jane"],
			["a name starting with a number", "1Anna"],
			["a name starting with a special character", "'tHooft"],
			["a name ending with a hyphen", "Anna-"],
		])("rejects a name that is %s", (_label, name) => {
			expect(
				registerSchema.safeParse({
					name,
					email: "asha@example.com",
					password: "Password1!",
				}).success,
			).toBe(false);
		});

		it("rejects a name longer than 50 characters", () => {
			expect(
				registerSchema.safeParse({
					name: "A".repeat(51),
					email: "asha@example.com",
					password: "Password1!",
				}).success,
			).toBe(false);
		});

		it.each([
			["a simple name", "Asha"],
			["accented / non-ASCII letters", "José Müller"],
			["an apostrophe", "O'Brien"],
			["a hyphenated compound name", "Jean-Luc Picard"],
			["multiple single-spaced words", "Mary Jane Watson"],
			["a name of exactly 50 characters", "A".repeat(50)],
		])("accepts %s", (_label, name) => {
			expect(
				registerSchema.safeParse({
					name,
					email: "asha@example.com",
					password: "Password1!",
				}).success,
			).toBe(true);
		});
	});
});

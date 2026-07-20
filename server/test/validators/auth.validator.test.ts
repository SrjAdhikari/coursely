//* test/validators/auth.validator.test.ts

import { describe, it, expect } from "vitest";
import {
	registerSchema,
	verifyEmailSchema,
	resetPasswordSchema,
	forgotPasswordSchema,
	resendVerificationSchema,
} from "../../src/validators/auth.validator";

const validCredentials = {
	email: "asha@example.com",
	password: "Password1!",
};

describe("auth validators — registerSchema name rule", () => {
	it.each([
		["all digits", "12313213"],
		["punctuation only", "..."],
		["an email address", "peyij91811@duvips.com"],
		["digits mixed with letters", "user9251813"],
		["a name with an interior newline", "Asha\nEvil"],
		["a name with an interior tab", "Asha\tEvil"],
		["a name containing a period", "John A. Smith"],
		["a name with a double space", "Mary  Jane"],
		["a name starting with a number", "1Anna"],
		["a name starting with a special character", "'tHooft"],
		["a name starting with a hyphen", "-Anna"],
		["a name ending with a hyphen", "Anna-"],
	])("rejects a name that is %s", (_label, name) => {
		expect(registerSchema.safeParse({ ...validCredentials, name }).success).toBe(
			false,
		);
	});

	it("rejects a name longer than 50 characters", () => {
		expect(
			registerSchema.safeParse({ ...validCredentials, name: "A".repeat(51) })
				.success,
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
		expect(registerSchema.safeParse({ ...validCredentials, name }).success).toBe(
			true,
		);
	});
});

describe("auth validators — registerSchema name sanitization", () => {
	it("strips HTML from the name and accepts the cleaned value", () => {
		const parsed = registerSchema.parse({
			...validCredentials,
			name: "<b>Asha</b>",
		});
		expect(parsed.name).toBe("Asha");
	});

	it("leaves valid names (apostrophes, hyphens, accents) unchanged", () => {
		const parsed = registerSchema.parse({
			...validCredentials,
			name: "  José O'Brien-Smith  ",
		});
		expect(parsed.name).toBe("José O'Brien-Smith");
	});

	it("still rejects a name that is only markup (collapses below min length)", () => {
		expect(
			registerSchema.safeParse({
				...validCredentials,
				name: "<script>x</script>",
			}).success,
		).toBe(false);
	});
});

describe("auth validators — verification + reset schemas", () => {
	it("verifyEmailSchema rejects an empty token and accepts a non-empty one", () => {
		expect(verifyEmailSchema.safeParse({ token: "" }).success).toBe(false);
		expect(verifyEmailSchema.safeParse({ token: "abc123" }).success).toBe(true);
	});

	it("resetPasswordSchema requires a token and a strong newPassword", () => {
		expect(
			resetPasswordSchema.safeParse({ token: "abc", newPassword: "weak" })
				.success,
		).toBe(false);
		expect(
			resetPasswordSchema.safeParse({ token: "abc", newPassword: "Password1!" })
				.success,
		).toBe(true);
	});

	// A weaker rule here would let users downgrade their password via reset.
	it.each([
		["too short", "Pass1!"],
		["no uppercase", "password1!"],
		["no lowercase", "PASSWORD1!"],
		["no number", "Password!!"],
		["no special character", "Password11"],
	])("resetPasswordSchema enforces the register rule — %s", (_case, weak) => {
		expect(registerSchema.safeParse({ ...validCredentials, name: "Asha Rai", password: weak }).success).toBe(false);
		expect(resetPasswordSchema.safeParse({ token: "abc", newPassword: weak }).success).toBe(false);
	});

	it("forgotPasswordSchema and resendVerificationSchema validate the email", () => {
		expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(
			false,
		);
		expect(
			forgotPasswordSchema.safeParse({ email: "asha@example.com" }).success,
		).toBe(true);
		expect(
			resendVerificationSchema.safeParse({ email: "asha@example.com" }).success,
		).toBe(true);
	});
});

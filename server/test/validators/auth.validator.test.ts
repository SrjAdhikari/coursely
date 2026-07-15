//* test/validators/auth.validator.test.ts

import { describe, it, expect } from "vitest";
import { registerSchema } from "../../src/validators/auth.validator";

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

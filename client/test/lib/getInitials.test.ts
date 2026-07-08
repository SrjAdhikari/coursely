//* test/lib/getInitials.test.ts

import { describe, it, expect } from "vitest";
import getInitials from "@/lib/getInitials";

describe("getInitials", () => {
	it("returns the first letters of the first two words", () => {
		expect(getInitials("Suraj Adhikari")).toBe("SA");
	});

	it("uppercases letters from a lowercase name", () => {
		expect(getInitials("john doe")).toBe("JD");
	});

	it("returns the first two letters when the name is a single word", () => {
		expect(getInitials("suraj")).toBe("SU");
	});

	it("uses only the first two words when the name has more than two", () => {
		expect(getInitials("John Quincy Adams")).toBe("JQ");
	});

	it("trims surrounding whitespace before splitting", () => {
		expect(getInitials("  Suraj Adhikari  ")).toBe("SA");
	});

	it("trims whitespace before slicing in the single-name fallback", () => {
		expect(getInitials("  suraj  ")).toBe("SU");
	});

	it("returns an empty string for empty or whitespace-only names", () => {
		expect(getInitials("")).toBe("");
		expect(getInitials("   ")).toBe("");
	});

	it("returns an empty string for a missing name (undefined)", () => {
		expect(getInitials(undefined)).toBe("");
	});
});

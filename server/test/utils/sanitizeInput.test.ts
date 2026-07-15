//* test/utils/sanitizeInput.test.ts

import { describe, it, expect } from "vitest";
import sanitizeInput from "../../src/utils/sanitizeInput";

describe("sanitizeInput", () => {
	it("leaves plain text unchanged", () => {
		expect(sanitizeInput("The Complete React Course")).toBe(
			"The Complete React Course",
		);
	});

	it("strips HTML tags but keeps the visible text", () => {
		expect(sanitizeInput("<b>Bold</b> and <i>italic</i>")).toBe(
			"Bold and italic",
		);
	});

	it("removes a <script> payload entirely", () => {
		expect(sanitizeInput("hello<script>alert('xss')</script>")).toBe("hello");
	});

	it("drops event-handler attributes (onerror) with the tag", () => {
		expect(sanitizeInput('<img src=x onerror="alert(1)">')).toBe("");
	});

	it("returns '' for non-string input", () => {
		expect(sanitizeInput(undefined)).toBe("");
		expect(sanitizeInput(null)).toBe("");
		expect(sanitizeInput(42)).toBe("");
		expect(sanitizeInput({ toString: () => "hi" })).toBe("");
	});

	it("trims whitespace left after stripping tags", () => {
		expect(sanitizeInput("  <p>spaced</p>  ")).toBe("spaced");
	});

	// Accepted trade-off: DOMPurify serializes to HTML, so a bare `<` is
	// entity-encoded rather than kept as literal text. Fields using this are
	// admin-authored and React escapes on render, so this stays as-is (no decode).
	it("HTML-encodes a bare `<` instead of decoding or stripping it", () => {
		expect(sanitizeInput("x < y")).toBe("x &lt; y");
	});
});

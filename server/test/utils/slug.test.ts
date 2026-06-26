//* test/utils/slug.test.ts

import { describe, it, expect } from "vitest";
import { slugify } from "../../src/utils/slug";

describe("slugify", () => {
	it("lowercases and hyphenates words", () => {
		expect(slugify("The Complete React Course")).toBe(
			"the-complete-react-course",
		);
	});

	it("strips punctuation and collapses runs of separators", () => {
		expect(slugify("Node.js  &  Express: A Guide!")).toBe(
			"node-js-express-a-guide",
		);
	});

	it("trims leading/trailing separators and whitespace", () => {
		expect(slugify("  --Hello World--  ")).toBe("hello-world");
	});

	it("falls back to 'course' when nothing slug-able remains", () => {
		expect(slugify("!!!")).toBe("course");
	});
});

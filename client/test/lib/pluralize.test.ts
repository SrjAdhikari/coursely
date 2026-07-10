import { describe, it, expect } from "vitest";

import pluralize, { pluralizeNoun } from "@/lib/pluralize";

describe("pluralize", () => {
	it("keeps the noun singular when the count is exactly 1", () => {
		expect(pluralize(1, "section")).toBe("1 section");
		expect(pluralize(1, "course")).toBe("1 course");
	});

	it("pluralizes the noun for any count other than 1", () => {
		expect(pluralize(0, "lesson")).toBe("0 lessons");
		expect(pluralize(2, "section")).toBe("2 sections");
		expect(pluralize(12, "course")).toBe("12 courses");
	});

	it("pluralizes a multi-word noun on its final word", () => {
		expect(pluralize(1, "video lesson")).toBe("1 video lesson");
		expect(pluralize(3, "video lesson")).toBe("3 video lessons");
	});
});

describe("pluralizeNoun", () => {
	it("keeps the noun singular when the count is exactly 1", () => {
		expect(pluralizeNoun(1, "active course")).toBe("active course");
	});

	it("pluralizes the noun for any count other than 1", () => {
		expect(pluralizeNoun(0, "active course")).toBe("active courses");
		expect(pluralizeNoun(2, "finished course")).toBe("finished courses");
	});

	it("pluralizes a multi-word noun on its final word", () => {
		expect(pluralizeNoun(1, "video lesson")).toBe("video lesson");
		expect(pluralizeNoun(3, "video lesson")).toBe("video lessons");
	});
});

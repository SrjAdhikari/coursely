import { describe, it, expect } from "vitest";

import pluralize from "@/lib/pluralize";

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

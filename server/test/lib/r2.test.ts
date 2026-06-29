//* test/lib/r2.test.ts

import { describe, it, expect } from "vitest";
import { lessonVideoKey, courseTrailerKey } from "../../src/lib/r2";

describe("r2 key builders", () => {
	it("builds the canonical lesson video key", () => {
		expect(lessonVideoKey("abc123")).toBe("lessons/abc123/source.mp4");
	});

	it("builds the canonical course trailer key", () => {
		expect(courseTrailerKey("xyz789")).toBe("courses/xyz789/trailer.mp4");
	});
});

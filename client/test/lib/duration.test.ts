//* test/lib/duration.test.ts

import { describe, it, expect } from "vitest";
import { formatLessonDuration, formatRuntime } from "@/lib/duration";

describe("formatLessonDuration", () => {
	it("formats under an hour as m:ss", () => {
		expect(formatLessonDuration(372)).toBe("6:12");
	});
	it("zero-pads seconds and handles zero", () => {
		expect(formatLessonDuration(0)).toBe("0:00");
		expect(formatLessonDuration(65)).toBe("1:05");
	});
	it("formats an hour or more as h:mm:ss", () => {
		expect(formatLessonDuration(3754)).toBe("1:02:34");
	});
	it("clamps negatives to zero", () => {
		expect(formatLessonDuration(-10)).toBe("0:00");
	});
});

describe("formatRuntime", () => {
	it("formats hours and minutes", () => {
		expect(formatRuntime(20520)).toBe("5h 42m");
	});
	it("formats minutes only under an hour", () => {
		expect(formatRuntime(372)).toBe("6m");
	});
	it("handles zero", () => {
		expect(formatRuntime(0)).toBe("0m");
	});
});

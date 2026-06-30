//* test/lib/playerHelpers.test.ts

import { describe, it, expect } from "vitest";

import { formatTime, clamp } from "@/lib/playerHelpers";

describe("formatTime", () => {
	it("formats sub-minute times as m:ss", () => {
		expect(formatTime(0)).toBe("0:00");
		expect(formatTime(5)).toBe("0:05");
		expect(formatTime(59)).toBe("0:59");
	});

	it("formats minutes with a zero-padded seconds field", () => {
		expect(formatTime(65)).toBe("1:05");
		expect(formatTime(599)).toBe("9:59");
	});

	it("switches to h:mm:ss only at or above one hour", () => {
		expect(formatTime(3600)).toBe("1:00:00");
		expect(formatTime(3661)).toBe("1:01:01");
	});

	it("guards against NaN, Infinity and negatives", () => {
		expect(formatTime(NaN)).toBe("0:00");
		expect(formatTime(Infinity)).toBe("0:00");
		expect(formatTime(-5)).toBe("0:00");
	});
});

describe("clamp", () => {
	it("returns the value when inside the range", () => {
		expect(clamp(5, 0, 10)).toBe(5);
	});

	it("clamps to the bounds when outside the range", () => {
		expect(clamp(-3, 0, 10)).toBe(0);
		expect(clamp(42, 0, 10)).toBe(10);
	});
});

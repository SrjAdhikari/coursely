//* test/lib/date.test.ts

import { describe, it, expect } from "vitest";
import { formatDate, formatRelativeTime } from "@/lib/date";

describe("formatDate", () => {
	it("formats an ISO string as a short en-IN date", () => {
		const result = formatDate("2026-06-28T00:00:00.000Z");
		expect(result).toMatch(/Jun/);
		expect(result).toMatch(/2026/);
	});
});

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const SECOND = 1000,
	MINUTE = 60 * SECOND,
	HOUR = 60 * MINUTE,
	DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
	it("shows 'just now' under a minute", () => {
		expect(formatRelativeTime(ago(30 * SECOND))).toBe("just now");
	});
	it("shows minutes", () => {
		expect(formatRelativeTime(ago(5 * MINUTE))).toBe("5m ago");
	});
	it("shows hours", () => {
		expect(formatRelativeTime(ago(2 * HOUR))).toBe("2h ago");
	});
	it("shows 'yesterday' at one day", () => {
		expect(formatRelativeTime(ago(1 * DAY + HOUR))).toBe("yesterday");
	});
	it("shows days under a week", () => {
		expect(formatRelativeTime(ago(3 * DAY))).toBe("3d ago");
	});
});

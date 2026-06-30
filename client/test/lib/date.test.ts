//* test/lib/date.test.ts

import { describe, it, expect } from "vitest";
import { formatDate } from "@/lib/date";

describe("formatDate", () => {
	it("formats an ISO string as a short en-IN date", () => {
		const result = formatDate("2026-06-28T00:00:00.000Z");
		expect(result).toMatch(/Jun/);
		expect(result).toMatch(/2026/);
	});
});

//* test/lib/currency.test.ts

import { describe, it, expect } from "vitest";
import { rupeesToPaise, paiseToRupees, formatPrice } from "@/lib/currency";

describe("currency helpers", () => {
	it("converts whole rupees to paise", () => {
		expect(rupeesToPaise(999)).toBe(99900);
		expect(rupeesToPaise(0)).toBe(0);
	});

	it("rounds fractional rupees to the nearest paise", () => {
		expect(rupeesToPaise(999.5)).toBe(99950);
	});

	it("converts paise back to rupees", () => {
		expect(paiseToRupees(99900)).toBe(999);
		expect(paiseToRupees(149900)).toBe(1499);
	});

	it("formats paise as an Indian-grouped rupee string", () => {
		expect(formatPrice(99900)).toBe("₹999");
		expect(formatPrice(149900)).toBe("₹1,499");
		expect(formatPrice(0)).toBe("₹0");
	});

	it("uses Indian lakh grouping for large amounts", () => {
		// Distinguishes en-IN ("1,00,000") from en-US ("100,000").
		expect(formatPrice(10000000)).toBe("₹1,00,000");
	});
});

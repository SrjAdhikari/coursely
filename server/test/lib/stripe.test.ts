//* test/lib/stripe.test.ts

import { describe, it, expect } from "vitest";

import stripe from "../../src/lib/stripe";

describe("stripe singleton", () => {
	it("constructs a Stripe client from env", () => {
		expect(stripe).toBeDefined();
		expect(typeof stripe.checkout.sessions.create).toBe("function");
		expect(typeof stripe.webhooks.constructEvent).toBe("function");
	});
});

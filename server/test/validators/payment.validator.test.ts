//* test/validators/payment.validator.test.ts

import { describe, it, expect } from "vitest";
import mongoose from "mongoose";

import { createCheckoutSchema } from "../../src/validators/payment.validator";

describe("createCheckoutSchema", () => {
	it("accepts a valid Mongo ObjectId courseId", () => {
		const courseId = new mongoose.Types.ObjectId().toString();
		const result = createCheckoutSchema.safeParse({ courseId });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.courseId).toBe(courseId);
	});

	it("rejects a non-ObjectId courseId", () => {
		const result = createCheckoutSchema.safeParse({ courseId: "not-an-id" });
		expect(result.success).toBe(false);
	});

	it("rejects a missing courseId", () => {
		const result = createCheckoutSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

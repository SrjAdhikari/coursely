//* test/services/payment.service.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/lib/stripe", () => ({
	default: {
		checkout: {
			sessions: { create: vi.fn(), retrieve: vi.fn() },
		},
		webhooks: { constructEvent: vi.fn(), generateTestHeaderString: vi.fn() },
	},
}));

import stripe from "../../src/lib/stripe";
import {
	createCheckoutSession,
	recordEnrollmentFromSession,
	getCheckoutStatus,
} from "../../src/services/payment.service";
import Enrollment from "../../src/models/enrollment.model";
import { createTestUser, createTestCourse } from "../helpers/factories";

const create = vi.mocked(stripe.checkout.sessions.create);
const retrieve = vi.mocked(stripe.checkout.sessions.retrieve);

beforeEach(() => vi.clearAllMocks());

describe("createCheckoutSession", () => {
	it("builds a session with the right amount/currency/metadata and returns the url", async () => {
		const user = await createTestUser();
		const course = await createTestCourse({ price: 49900, title: "React 101" });
		create.mockResolvedValue({ url: "https://stripe.test/cs_1" } as never);

		const result = await createCheckoutSession(
			user._id.toString(),
			course._id.toString(),
		);

		expect(result).toEqual({ url: "https://stripe.test/cs_1" });
		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				mode: "payment",
				client_reference_id: user._id.toString(),
				customer_email: user.email,
				metadata: {
					userId: user._id.toString(),
					courseId: course._id.toString(),
				},
				line_items: [
					expect.objectContaining({
						quantity: 1,
						price_data: expect.objectContaining({
							currency: "inr",
							unit_amount: 49900,
							product_data: { name: "React 101" },
						}),
					}),
				],
			}),
		);
	});

	it("404s a draft (or missing) course without leaking existence", async () => {
		const user = await createTestUser();
		const draft = await createTestCourse({ isPublished: false });

		await expect(
			createCheckoutSession(user._id.toString(), draft._id.toString()),
		).rejects.toMatchObject({
			statusCode: 404,
			errorCode: "COURSE_NOT_FOUND",
		});
		expect(create).not.toHaveBeenCalled();
	});

	it("409s when the user is already enrolled", async () => {
		const user = await createTestUser();
		const course = await createTestCourse({ price: 49900 });
		await Enrollment.create({ userId: user._id, courseId: course._id });

		await expect(
			createCheckoutSession(user._id.toString(), course._id.toString()),
		).rejects.toMatchObject({
			statusCode: 409,
			errorCode: "ALREADY_ENROLLED",
		});
		expect(create).not.toHaveBeenCalled();
	});
});

describe("recordEnrollmentFromSession", () => {
	it("enrolls when the amount and currency match", async () => {
		const user = await createTestUser();
		const course = await createTestCourse({ price: 49900 });

		const enrollment = await recordEnrollmentFromSession({
			id: "cs_ok",
			amount_total: 49900,
			currency: "inr",
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
			},
		} as never);

		expect(enrollment).not.toBeNull();
		expect(
			await Enrollment.countDocuments({
				userId: user._id,
				courseId: course._id,
			}),
		).toBe(1);
	});

	it("skips enrollment (no row) when the amount is tampered", async () => {
		const user = await createTestUser();
		const course = await createTestCourse({ price: 49900 });

		const enrollment = await recordEnrollmentFromSession({
			id: "cs_bad",
			amount_total: 100,
			currency: "inr",
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
			},
		} as never);

		expect(enrollment).toBeNull();
		expect(
			await Enrollment.countDocuments({
				userId: user._id,
				courseId: course._id,
			}),
		).toBe(0);
	});
});

describe("getCheckoutStatus", () => {
	it("404s an unknown session id", async () => {
		const user = await createTestUser();
		retrieve.mockRejectedValue(
			Object.assign(new Error("No such session"), {
				statusCode: 404,
				code: "resource_missing",
			}),
		);

		await expect(
			getCheckoutStatus(user._id.toString(), "cs_missing"),
		).rejects.toMatchObject({
			statusCode: 404,
			errorCode: "CHECKOUT_SESSION_NOT_FOUND",
		});
	});

	it("403s when the session belongs to a different user (IDOR)", async () => {
		const user = await createTestUser();
		const course = await createTestCourse({ price: 49900 });
		retrieve.mockResolvedValue({
			id: "cs_other",
			payment_status: "paid",
			amount_total: 49900,
			currency: "inr",
			metadata: { userId: "someone-else", courseId: course._id.toString() },
		} as never);

		await expect(
			getCheckoutStatus(user._id.toString(), "cs_other"),
		).rejects.toMatchObject({ statusCode: 403 });
	});

	it("reconciles a paid session into an enrollment", async () => {
		const user = await createTestUser();
		const course = await createTestCourse({ price: 49900, slug: "react", title: "React" });
		retrieve.mockResolvedValue({
			id: "cs_paid",
			payment_status: "paid",
			amount_total: 49900,
			currency: "inr",
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
			},
		} as never);

		const result = await getCheckoutStatus(user._id.toString(), "cs_paid");

		expect(result).toEqual({
			enrolled: true,
			status: "paid",
			course: { slug: "react", title: "React" },
		});
		expect(
			await Enrollment.countDocuments({
				userId: user._id,
				courseId: course._id,
			}),
		).toBe(1);
	});

	it("does not enroll an unpaid session", async () => {
		const user = await createTestUser();
		const course = await createTestCourse({ price: 49900 });
		retrieve.mockResolvedValue({
			id: "cs_unpaid",
			payment_status: "unpaid",
			amount_total: 49900,
			currency: "inr",
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
			},
		} as never);

		const result = await getCheckoutStatus(user._id.toString(), "cs_unpaid");

		expect(result).toEqual({ enrolled: false, status: "unpaid" });
		expect(
			await Enrollment.countDocuments({
				userId: user._id,
				courseId: course._id,
			}),
		).toBe(0);
	});
});

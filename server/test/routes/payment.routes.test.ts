//* test/routes/payment.routes.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";

import app from "../../src/app";
import stripe from "../../src/lib/stripe";
import envConfig from "../../src/constants/env";
import Enrollment from "../../src/models/enrollment.model";
import { createTestUser, createTestCourse } from "../helpers/factories";

const { STRIPE_WEBHOOK_SECRET, APP_ORIGIN } = envConfig;
const PASSWORD = "Password@123";

// Log a student in via the real auth flow; returns the agent + the user doc.
const studentAgent = async () => {
	const agent = request.agent(app).set("Origin", APP_ORIGIN);
	const user = await createTestUser({
		email: `buyer-${Date.now()}@example.com`,
		password: PASSWORD,
		role: "student",
	});
	await agent.post("/api/auth/login").send({ email: user.email, password: PASSWORD });
	const studentSession = { agent, user };
	return studentSession;
};

// Build a signed checkout.session.completed event whose raw body and signature
// match byte-for-byte (the webhook verifies the unparsed bytes).
const signedWebhook = (
	sessionObject: Record<string, unknown>,
	eventType = "checkout.session.completed",
) => {
	const { metadata, ...sessionOverrides } = sessionObject;
	const event = {
		id: "evt_test",
		object: "event",
		type: eventType,
		data: {
			object: {
				id: "cs_webhook",
				object: "checkout.session",
				payment_status: "paid",
				amount_total: 49900,
				currency: "inr",
				...sessionOverrides,
				// Snapshot stamped at checkout creation; the handler validates against it.
				metadata: {
					expectedAmount: "49900",
					expectedCurrency: "inr",
					...(metadata as Record<string, unknown>),
				},
			},
		},
	};
	const payload = JSON.stringify(event);
	const header = stripe.webhooks.generateTestHeaderString({
		payload,
		secret: STRIPE_WEBHOOK_SECRET,
	});
	const signedRequest = { payload, header };
	return signedRequest;
};

beforeEach(() => vi.restoreAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("POST /api/checkout", () => {
	it("returns a checkout url for a published course", async () => {
		const { agent } = await studentAgent();
		const course = await createTestCourse({ price: 49900 });
		vi.spyOn(stripe.checkout.sessions, "create").mockResolvedValue({
			url: "https://stripe.test/cs_1",
		} as never);

		const res = await agent
			.post("/api/checkout")
			.send({ courseId: course._id.toString() });

		expect(res.status).toBe(200);
		expect(res.body.data.url).toBe("https://stripe.test/cs_1");
	});

	it("401s an unauthenticated request", async () => {
		const course = await createTestCourse({ price: 49900 });
		const res = await request(app)
			.post("/api/checkout")
			.send({ courseId: course._id.toString() });
		expect(res.status).toBe(401);
	});

	it("409s when already enrolled", async () => {
		const { agent, user } = await studentAgent();
		const course = await createTestCourse({ price: 49900 });
		await Enrollment.create({ userId: user._id, courseId: course._id });

		const res = await agent
			.post("/api/checkout")
			.send({ courseId: course._id.toString() });
		expect(res.status).toBe(409);
		expect(res.body.error.code).toBe("ALREADY_ENROLLED");
	});
});

describe("payment & webhook rate-limit tiers", () => {
	it("applies the tighter payment tier to checkout (not just the 1000/15m global tier)", async () => {
		const { agent } = await studentAgent();
		const course = await createTestCourse({ price: 49900 });
		vi.spyOn(stripe.checkout.sessions, "create").mockResolvedValue({
			url: "https://stripe.test/cs_ratelimit",
		} as never);

		const res = await agent
			.post("/api/checkout")
			.send({ courseId: course._id.toString() });

		expect(res.headers["ratelimit-limit"]).toBe("50");
	});

	it("applies a separate, more generous tier to checkout-status polling", async () => {
		const { agent, user } = await studentAgent();
		const course = await createTestCourse({ price: 49900 });
		vi.spyOn(stripe.checkout.sessions, "retrieve").mockResolvedValue({
			id: "cs_status_ratelimit",
			payment_status: "paid",
			amount_total: 49900,
			currency: "inr",
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
				expectedAmount: "49900",
				expectedCurrency: "inr",
			},
		} as never);

		const res = await agent.get("/api/checkout/cs_status_ratelimit/status");

		expect(res.headers["ratelimit-limit"]).toBe("200");
	});

	it("rate-limits the Stripe webhook mount", async () => {
		const user = await createTestUser({ email: "wh-limit@example.com" });
		const course = await createTestCourse({ price: 49900 });
		const { payload, header } = signedWebhook({
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
			},
		});

		const res = await request(app)
			.post("/api/webhooks/stripe")
			.set("Content-Type", "application/json")
			.set("stripe-signature", header)
			.send(payload);

		expect(res.headers["ratelimit-limit"]).toBe("300");
	});

	it("does not spend the webhook budget on legit, verified events", async () => {
		// skipSuccessfulRequests refunds 2xx webhooks, so a run of real Stripe
		// events never depletes the bucket (only forged 4xx requests count).
		const sendValidWebhook = async (email: string) => {
			const user = await createTestUser({ email });
			const course = await createTestCourse({ price: 49900 });
			const { payload, header } = signedWebhook({
				metadata: {
					userId: user._id.toString(),
					courseId: course._id.toString(),
				},
			});
			return request(app)
				.post("/api/webhooks/stripe")
				.set("Content-Type", "application/json")
				.set("stripe-signature", header)
				.send(payload);
		};

		const first = await sendValidWebhook("wh-skip-1@example.com");
		const second = await sendValidWebhook("wh-skip-2@example.com");

		expect(first.headers["ratelimit-remaining"]).toBeDefined();
		expect(second.headers["ratelimit-remaining"]).toBe(
			first.headers["ratelimit-remaining"],
		);
	});
});

describe("POST /api/webhooks/stripe", () => {
	it("enrolls on a valid, paid, correctly-priced event", async () => {
		const user = await createTestUser({ email: "wh@example.com" });
		const course = await createTestCourse({ price: 49900 });
		const { payload, header } = signedWebhook({
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
			},
		});

		const res = await request(app)
			.post("/api/webhooks/stripe")
			.set("Content-Type", "application/json")
			.set("stripe-signature", header)
			.send(payload);

		expect(res.status).toBe(200);
		expect(res.body.received).toBe(true);
		expect(
			await Enrollment.countDocuments({ userId: user._id, courseId: course._id }),
		).toBe(1);
	});

	it("400s an invalid signature and writes nothing", async () => {
		const user = await createTestUser({ email: "wh2@example.com" });
		const course = await createTestCourse({ price: 49900 });
		const { payload } = signedWebhook({
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
			},
		});

		const res = await request(app)
			.post("/api/webhooks/stripe")
			.set("Content-Type", "application/json")
			.set("stripe-signature", "t=1,v1=deadbeef")
			.send(payload);

		expect(res.status).toBe(400);
		expect(res.body.error.code).toBe("WEBHOOK_SIGNATURE_INVALID");
		expect(
			await Enrollment.countDocuments({ userId: user._id, courseId: course._id }),
		).toBe(0);
	});

	it("acknowledges (200) but does not enroll on an amount mismatch", async () => {
		const user = await createTestUser({ email: "wh3@example.com" });
		const course = await createTestCourse({ price: 49900 });
		const { payload, header } = signedWebhook({
			amount_total: 100,
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
			},
		});

		const res = await request(app)
			.post("/api/webhooks/stripe")
			.set("Content-Type", "application/json")
			.set("stripe-signature", header)
			.send(payload);

		expect(res.status).toBe(200);
		expect(res.body.received).toBe(true);
		expect(
			await Enrollment.countDocuments({ userId: user._id, courseId: course._id }),
		).toBe(0);
	});

	it("acknowledges (200) but does not enroll an unpaid session", async () => {
		const user = await createTestUser({ email: "wh4@example.com" });
		const course = await createTestCourse({ price: 49900 });
		const { payload, header } = signedWebhook({
			payment_status: "unpaid",
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
			},
		});

		const res = await request(app)
			.post("/api/webhooks/stripe")
			.set("Content-Type", "application/json")
			.set("stripe-signature", header)
			.send(payload);

		expect(res.status).toBe(200);
		expect(res.body.received).toBe(true);
		expect(
			await Enrollment.countDocuments({ userId: user._id, courseId: course._id }),
		).toBe(0);
	});

	it("acknowledges (200) but does not enroll on an unrelated event type", async () => {
		const user = await createTestUser({ email: "wh5@example.com" });
		const course = await createTestCourse({ price: 49900 });
		const { payload, header } = signedWebhook(
			{
				metadata: {
					userId: user._id.toString(),
					courseId: course._id.toString(),
				},
			},
			"payment_intent.succeeded",
		);

		const res = await request(app)
			.post("/api/webhooks/stripe")
			.set("Content-Type", "application/json")
			.set("stripe-signature", header)
			.send(payload);

		expect(res.status).toBe(200);
		expect(res.body.received).toBe(true);
		expect(
			await Enrollment.countDocuments({ userId: user._id, courseId: course._id }),
		).toBe(0);
	});
});

describe("GET /api/checkout/:sessionId/status", () => {
	it("403s when the session belongs to another user", async () => {
		const { agent } = await studentAgent();
		const course = await createTestCourse({ price: 49900 });
		vi.spyOn(stripe.checkout.sessions, "retrieve").mockResolvedValue({
			id: "cs_x",
			payment_status: "paid",
			amount_total: 49900,
			currency: "inr",
			metadata: { userId: "another-user", courseId: course._id.toString() },
		} as never);

		const res = await agent.get("/api/checkout/cs_x/status");
		expect(res.status).toBe(403);
	});

	it("403s when the retrieved session has no metadata.userId", async () => {
		const { agent } = await studentAgent();
		const course = await createTestCourse({ price: 49900 });
		vi.spyOn(stripe.checkout.sessions, "retrieve").mockResolvedValue({
			id: "cs_nometa",
			payment_status: "paid",
			amount_total: 49900,
			currency: "inr",
			metadata: { courseId: course._id.toString() },
		} as never);

		const res = await agent.get("/api/checkout/cs_nometa/status");
		expect(res.status).toBe(403);
	});

	it("reconciles a paid session and reports enrolled", async () => {
		const { agent, user } = await studentAgent();
		const course = await createTestCourse({ price: 49900, slug: "react", title: "React" });
		vi.spyOn(stripe.checkout.sessions, "retrieve").mockResolvedValue({
			id: "cs_paid",
			payment_status: "paid",
			amount_total: 49900,
			currency: "inr",
			metadata: {
				userId: user._id.toString(),
				courseId: course._id.toString(),
				expectedAmount: "49900",
				expectedCurrency: "inr",
			},
		} as never);

		const res = await agent.get("/api/checkout/cs_paid/status");
		expect(res.status).toBe(200);
		expect(res.body.data).toEqual({
			enrolled: true,
			status: "paid",
			course: { slug: "react", title: "React" },
		});
	});
});

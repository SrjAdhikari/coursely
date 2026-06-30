//* src/controllers/payment.controller.ts

import type { RequestHandler } from "express";
import type Stripe from "stripe";

import {
	createCheckoutSession,
	getCheckoutStatus,
	recordEnrollmentFromSession,
} from "../services/payment.service";
import stripe from "../lib/stripe";

import AppError from "../errors/AppError";

import envConfig from "../constants/env";
import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { STRIPE_WEBHOOK_SECRET } = envConfig;
const { OK, BAD_REQUEST } = httpStatus;
const { WEBHOOK_SIGNATURE_INVALID } = appErrorCode;

/** Create a hosted-Checkout session for the authenticated buyer. */
const createCheckoutHandler: RequestHandler = async (req, res) => {
	const { courseId } = req.body;
	const userId = req.user!.id;

	const { url } = await createCheckoutSession(userId, courseId);

	res.status(OK).json({
		success: true,
		message: "Checkout session created successfully",
		data: { url },
	});
};

/** Reconcile a Checkout session for the success page (own session only). */
const getCheckoutStatusHandler: RequestHandler<{ sessionId: string }> = async (
	req,
	res,
) => {
	const userId = req.user!.id;
	const sessionId = req.params.sessionId;

	const status = await getCheckoutStatus(userId, sessionId);

	res.status(OK).json({
		success: true,
		message: "Checkout status fetched successfully",
		data: status,
	});
};

/**
 * Stripe webhook. Verifies the signature against the unparsed body, then records
 * the enrollment for a paid `checkout.session.completed`. Replies with a bare
 * `{ received: true }` (Stripe only checks the 2xx status, not an app envelope).
 */
const stripeWebhookHandler: RequestHandler = async (req, res) => {
	const signature = req.headers["stripe-signature"] as string | undefined;

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			signature ?? "",
			STRIPE_WEBHOOK_SECRET,
		);
	} catch {
		throw new AppError(
			"Invalid webhook signature",
			BAD_REQUEST,
			WEBHOOK_SIGNATURE_INVALID,
		);
	}

	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;
		if (session.payment_status === "paid") {
			await recordEnrollmentFromSession(session);
		}
	}

	res.status(OK).json({ received: true });
};

export { createCheckoutHandler, getCheckoutStatusHandler, stripeWebhookHandler };

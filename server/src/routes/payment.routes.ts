//* src/routes/payment.routes.ts

/**
 * Payment Routes — authenticated checkout + reconciliation, and the Stripe webhook.
 * @module routes/payment
 */

import { Router } from "express";

import {
	createCheckoutHandler,
	getCheckoutStatusHandler,
	stripeWebhookHandler,
} from "../controllers/payment.controller";

import authenticate from "../middlewares/auth.middleware";
import validateBody from "../middlewares/validate.middleware";

import { createCheckoutSchema } from "../validators/payment.validator";

/** Authenticated checkout router — mounted at /api/checkout */
const paymentRouter = Router();

/** Stripe webhook router — mounted at /api/webhooks/stripe with a raw body (no auth) */
const stripeWebhookRouter = Router();

/**
 * Create a Checkout session
 * @route POST /api/checkout
 */
paymentRouter.post(
	"/",
	authenticate,
	validateBody(createCheckoutSchema),
	createCheckoutHandler,
);

/**
 * Reconcile a Checkout session (own session only)
 * @route GET /api/checkout/:sessionId/status
 */
paymentRouter.get("/:sessionId/status", authenticate, getCheckoutStatusHandler);

/**
 * Stripe webhook — signature-verified, server-to-server
 * @route POST /api/webhooks/stripe
 */
stripeWebhookRouter.post("/", stripeWebhookHandler);

export { paymentRouter, stripeWebhookRouter };

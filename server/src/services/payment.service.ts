//* src/services/payment.service.ts

import type Stripe from "stripe";

import Course from "../models/course.model";
import User from "../models/user.model";

import stripe from "../lib/stripe";
import { isEnrolled, createEnrollment } from "./enrollment.service";

import AppError from "../errors/AppError";

import envConfig from "../constants/env";
import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { APP_ORIGIN } = envConfig;
const { NOT_FOUND, CONFLICT, FORBIDDEN } = httpStatus;
const {
	COURSE_NOT_FOUND,
	ALREADY_ENROLLED,
	CHECKOUT_SESSION_NOT_FOUND,
	UNAUTHORIZED_ACCESS,
	PAYMENT_AMOUNT_MISMATCH,
} = appErrorCode;

/** Stripe rejects an unknown session id with a 404 / resource_missing error. */
const isSessionNotFound = (error: unknown): boolean => {
	const stripeError = error as { statusCode?: number; code?: string };
	const sessionNotFound =
		stripeError?.statusCode === 404 || stripeError?.code === "resource_missing";
	return sessionNotFound;
};

/**
 * Create a Stripe hosted-Checkout session for a published course.
 *
 * @param userId - The buyer's user id.
 * @param courseId - The course to purchase.
 *
 * @returns `{ url }` — the hosted Checkout URL to redirect the browser to.
 * @throws {AppError} 404 COURSE_NOT_FOUND if the course is missing or a draft.
 * @throws {AppError} 409 ALREADY_ENROLLED if the user already owns the course.
 */
const createCheckoutSession = async (
	userId: string,
	courseId: string,
): Promise<{ url: string | null }> => {
	const course = await Course.findOne({
		_id: courseId,
		isPublished: true,
	}).lean();
	if (!course) {
		throw new AppError("Course not found", NOT_FOUND, COURSE_NOT_FOUND);
	}

	if (await isEnrolled(userId, courseId)) {
		throw new AppError(
			"You are already enrolled in this course",
			CONFLICT,
			ALREADY_ENROLLED,
		);
	}

	const user = await User.findById(userId).lean();

	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: course.currency.toLowerCase(),
					unit_amount: course.price,
					product_data: { name: course.title },
				},
			},
		],
		metadata: { userId, courseId },
		client_reference_id: userId,
		customer_email: user?.email,
		success_url: `${APP_ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${APP_ORIGIN}/checkout/cancel`,
	});

	const checkoutSession = { url: session.url };
	return checkoutSession;
};

/**
 * Validate a paid Checkout session and idempotently record the enrollment. Shared
 * by the webhook and the reconciliation endpoint. A tampered/stale amount or
 * currency is logged and skipped (returns null) rather than throwing, so the
 * webhook can still acknowledge with 200 and stop Stripe's retries.
 *
 * @param session - The Stripe Checkout session (paid).
 * @returns The enrollment row, or null when the session can't be honored.
 */
const recordEnrollmentFromSession = async (
	session: Stripe.Checkout.Session,
) => {
	const userId = session.metadata?.userId;
	const courseId = session.metadata?.courseId;
	if (!userId || !courseId) return null;

	const course = await Course.findById(courseId).lean();
	if (!course) return null;

	const expectedAmount = course.price;
	const expectedCurrency = course.currency.toLowerCase();

	if (
		session.amount_total !== expectedAmount ||
		session.currency !== expectedCurrency
	) {
		console.error(`[${PAYMENT_AMOUNT_MISMATCH}]`, {
			sessionId: session.id,
			courseId,
			expectedAmount,
			actualAmount: session.amount_total,
		});
		return null;
	}

	const enrollment = await createEnrollment({
		userId,
		courseId,
		stripeSessionId: session.id,
		amountPaid: course.price,
		currency: course.currency,
	});

	return enrollment;
};

/**
 * Reconcile a Checkout session for the success page — the server asks Stripe
 * directly, never trusting a browser "I paid". Asserts the caller owns the
 * session (anti-IDOR), then records the enrollment when paid.
 *
 * @param userId - The caller's user id.
 * @param sessionId - The Stripe Checkout session id.
 *
 * @returns `{ enrolled, status, course? }` — enrolled true only after a paid + valid session.
 * @throws {AppError} 404 CHECKOUT_SESSION_NOT_FOUND if Stripe has no such session.
 * @throws {AppError} 403 if the session belongs to a different user.
 */
const getCheckoutStatus = async (userId: string, sessionId: string) => {
	let session: Stripe.Checkout.Session;
	try {
		session = await stripe.checkout.sessions.retrieve(sessionId);
	} catch (error) {
		if (isSessionNotFound(error)) {
			throw new AppError(
				"Checkout session not found",
				NOT_FOUND,
				CHECKOUT_SESSION_NOT_FOUND,
			);
		}
		throw error;
	}

	if (session.metadata?.userId !== userId) {
		throw new AppError(
			"You do not have access to this checkout session",
			FORBIDDEN,
			UNAUTHORIZED_ACCESS,
		);
	}

	if (session.payment_status === "paid") {
		const enrollment = await recordEnrollmentFromSession(session);
		if (enrollment) {
			const course = await Course.findById(session.metadata?.courseId).lean();
			const paidStatus = {
				enrolled: true,
				status: "paid",
				course: { slug: course?.slug, title: course?.title },
			};
			return paidStatus;
		}
	}

	const pendingStatus = { enrolled: false, status: session.payment_status };
	return pendingStatus;
};

export {
	createCheckoutSession,
	recordEnrollmentFromSession,
	getCheckoutStatus,
};

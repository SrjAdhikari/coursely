//* src/api/payments.api.ts

import axiosClient from "@/config/axiosClient";

import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	CheckoutSessionPayload,
	CheckoutStatusPayload,
} from "@/types/payment.types";

/** Create a Stripe hosted-Checkout session for a course. */
const createCheckout = async (courseId: string) => {
	const { data } = await axiosClient.post<
		ApiSuccessResponse<CheckoutSessionPayload>
	>("/checkout", { courseId });
	return data;
};

/** Reconcile a Checkout session for the success page (own session only). */
const getCheckoutStatus = async (sessionId: string) => {
	const { data } = await axiosClient.get<
		ApiSuccessResponse<CheckoutStatusPayload>
	>(`/checkout/${sessionId}/status`);
	return data;
};

export { createCheckout, getCheckoutStatus };

//* src/types/payment.types.ts

/** The hosted Stripe Checkout URL returned when a session is created. */
export interface CheckoutSessionPayload {
	url: string | null;
}

/** The reconciled status of a Checkout session (success page). */
export interface CheckoutStatusPayload {
	enrolled: boolean;
	status: string;
	course?: { slug: string; title: string };
}

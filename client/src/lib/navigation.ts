//* src/lib/navigation.ts

/** Hard-redirect the browser to an external URL (e.g. Stripe Checkout). */
export const redirectTo = (url: string): void => {
	window.location.assign(url);
};

//* src/lib/currency.ts

/** Convert rupees (the displayed unit) to integer paise (the stored unit). */
export const rupeesToPaise = (rupees: number): number =>
	Math.round(rupees * 100);

/** Convert stored paise back to rupees. */
export const paiseToRupees = (paise: number): number => paise / 100;

/** Format stored paise as a grouped ₹ string, e.g. 149900 → "₹1,499". */
export const formatPrice = (paise: number): string =>
	`₹${paiseToRupees(paise).toLocaleString("en-IN")}`;

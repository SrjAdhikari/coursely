//* src/lib/date.ts

/** Format an ISO date string as a short en-IN date, e.g. "28 Jun 2026". */
export const formatDate = (date: string): string => {
	if (!date) return "";
	return new Date(date).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

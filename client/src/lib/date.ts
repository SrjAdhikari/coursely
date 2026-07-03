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

/** Short relative time for recent activity, e.g. "just now" / "5m ago" / "2h ago" / "yesterday" / "3d ago". */
export const formatRelativeTime = (isoDate: string): string => {
	const elapsedSeconds = Math.round(
		(Date.now() - new Date(isoDate).getTime()) / 1000,
	);
	if (elapsedSeconds < 60) return "just now";

	const minutes = Math.floor(elapsedSeconds / 60);
	if (minutes < 60) return `${minutes}m ago`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;

	const days = Math.floor(hours / 24);
	if (days === 1) return "yesterday";

	if (days < 7) return `${days}d ago`;
	return formatDate(isoDate);
};

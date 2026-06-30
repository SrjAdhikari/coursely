//* src/lib/playerHelpers.ts

/** Clamp a number into the inclusive [min, max] range. */
export const clamp = (value: number, min: number, max: number): number =>
	Math.min(max, Math.max(min, value));

/**
 * Format a seconds count as `m:ss`, switching to `h:mm:ss` only at >= 1 hour.
 * Non-finite or negative inputs collapse to `0:00` (e.g. an unread duration).
 */
export const formatTime = (totalSeconds: number): string => {
	if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";

	const whole = Math.floor(totalSeconds);
	const hours = Math.floor(whole / 3600);
	const minutes = Math.floor((whole % 3600) / 60);
	const seconds = whole % 60;
	const paddedSeconds = String(seconds).padStart(2, "0");

	if (hours > 0) {
		const paddedMinutes = String(minutes).padStart(2, "0");
		return `${hours}:${paddedMinutes}:${paddedSeconds}`;
	}
	return `${minutes}:${paddedSeconds}`;
};

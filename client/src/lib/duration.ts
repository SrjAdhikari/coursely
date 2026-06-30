//* src/lib/duration.ts

/** Format a lesson length (seconds) as m:ss, or h:mm:ss past an hour. */
export const formatLessonDuration = (totalSeconds: number): string => {
	const safe = Math.max(0, Math.floor(totalSeconds));

	const hours = Math.floor(safe / 3600);
	const minutes = Math.floor((safe % 3600) / 60);
	const seconds = safe % 60;
	const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
	const ss = String(seconds).padStart(2, "0");

	return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
};

/** Format a total runtime (seconds) as "Xh Ym" / "Ym" for the course summary. */
export const formatRuntime = (totalSeconds: number): string => {
	const safe = Math.max(0, Math.floor(totalSeconds));
	
	const hours = Math.floor(safe / 3600);
	const minutes = Math.floor((safe % 3600) / 60);
	const runtime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

	return runtime;
};

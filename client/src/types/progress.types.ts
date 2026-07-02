//* src/types/progress.types.ts

/** A single lesson's progress as returned by the per-course read. */
export interface ProgressPayload {
	lessonId: string;
	positionSeconds: number;
	completed: boolean;
}

/** The body sent when reporting a playhead. */
export interface SaveProgressPayload {
	positionSeconds: number;
}

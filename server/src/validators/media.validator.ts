//* src/validators/media.validator.ts

import { z } from "zod";

// Duration is read client-side from the <video> element (a float) and rounded
// before send; the API stores integer seconds. The storage key is NEVER accepted
// from the client — the server derives it deterministically.
const setLessonVideoSchema = z.object({
	duration: z
		.number()
		.int("Duration must be an integer (seconds)")
		.min(1, "Duration must be at least 1 second"),
});

type SetLessonVideoInput = z.infer<typeof setLessonVideoSchema>;

export { setLessonVideoSchema };
export type { SetLessonVideoInput };

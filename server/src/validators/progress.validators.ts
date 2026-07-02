//* src/validators/progress.validators.ts

import { z } from "zod";
import { isValidObjectId } from "mongoose";

/** Create a validator for a string that must be a valid ObjectId. */
const objectId = (label: string) =>
	z
		.string()
		.refine((value) => isValidObjectId(value), `${label} must be a valid id`);

const lessonIdParamSchema = z.object({ lessonId: objectId("lessonId") });
const courseIdParamSchema = z.object({ courseId: objectId("courseId") });

const saveProgressSchema = z.object({
	positionSeconds: z.number().min(0, "positionSeconds must be at least 0"),
});

type SaveProgressInput = z.infer<typeof saveProgressSchema>;

export { lessonIdParamSchema, courseIdParamSchema, saveProgressSchema };
export type { SaveProgressInput };

//* src/validators/payment.validator.ts

import { z } from "zod";
import { isValidObjectId } from "mongoose";

// The course key is validated before any Stripe call, so a malformed id is a clean
// 400 here rather than a downstream CastError. isValidObjectId is the same validity
// check the route-level validateId middleware will use (rolled out in a separate PR).
const createCheckoutSchema = z.object({
	courseId: z
		.string()
		.trim()
		.refine((value) => isValidObjectId(value), "courseId must be a valid id"),
});

type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

export { createCheckoutSchema };
export type { CreateCheckoutInput };

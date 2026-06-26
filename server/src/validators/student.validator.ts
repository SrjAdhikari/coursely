//* src/validators/student.validator.ts

import { z } from "zod";

const updateStudentSchema = z
	.object({
		role: z.enum(["student", "admin"]).optional(),
		isActive: z.boolean().optional(),
	})
	.refine((data) => data.role !== undefined || data.isActive !== undefined, {
		message: "Provide at least one field to update (role or isActive)",
	});

type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export { updateStudentSchema };
export type { UpdateStudentInput };

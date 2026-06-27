//* src/types/student.types.ts

import type { UserRole } from "@/types/auth.types";

/** A learner (a user with role "student"). */
export interface StudentPayload {
	_id: string;
	name: string;
	email: string;
	role: UserRole;
	isActive: boolean;
	createdAt: string;
}

/** Admins may change only role and/or account status. */
export interface UpdateStudentPayload {
	role?: UserRole;
	isActive?: boolean;
}

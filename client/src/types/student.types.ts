//* src/types/student.types.ts

import type { UserRole } from "@/types/auth.types";

/** One of a student's course enrollments, for the admin detail view. */
export interface StudentEnrollmentPayload {
	courseId: string;
	course: string;
	purchased: string | null;
	amount: number;
	progress: number;
}

/** A learner (a user with role "student"). */
export interface StudentPayload {
	_id: string;
	name: string;
	email: string;
	role: UserRole;
	isActive: boolean;
	createdAt: string;
	enrollments: StudentEnrollmentPayload[];
}

/** Admins may change only role and/or account status. */
export interface UpdateStudentPayload {
	role?: UserRole;
	isActive?: boolean;
}

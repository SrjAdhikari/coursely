//* src/types/auth.types.ts

export type UserRole = "student" | "admin";

/** The authenticated user as returned by `GET /api/auth/me`. */
export interface UserPayload {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

/** Request body for `POST /api/auth/register`. */
export interface RegisterPayload {
	name: string;
	email: string;
	password: string;
}

/** Request body for `POST /api/auth/login`. */
export interface LoginPayload {
	email: string;
	password: string;
}

/** Request body for `POST /api/auth/google`. */
export interface GoogleSignInPayload {
	idToken: string;
}

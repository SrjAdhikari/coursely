//* test/helpers/factories.ts

import User, { type UserRole } from "../../src/models/user.model";

interface UserOverrides {
	name?: string;
	email?: string;
	password?: string;
	role?: UserRole;
	isActive?: boolean;
}

let counter = 0;

/**
 * Insert a user with a real (model-hashed) password so login flows work in
 * tests. The User model's pre-save hook hashes the raw password.
 */
const createTestUser = async (overrides: UserOverrides = {}) => {
	counter += 1;
	return User.create({
		name: overrides.name ?? `Test User ${counter}`,
		email: overrides.email ?? `user-${counter}@example.com`,
		password: overrides.password ?? "Password123",
		role: overrides.role ?? "student",
		isActive: overrides.isActive ?? true,
	});
};

export { createTestUser };

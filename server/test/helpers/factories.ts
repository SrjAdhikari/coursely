//* test/helpers/factories.ts

import User, { type UserRole } from "../../src/models/user.model";
import Course from "../../src/models/course.model";
import Section from "../../src/models/section.model";
import Lesson from "../../src/models/lesson.model";
import Enrollment from "../../src/models/enrollment.model";
import Progress from "../../src/models/progress.model";
import Session from "../../src/models/session.model";
import { createSessionToken } from "../../src/utils/sessionToken";
import type { Types } from "mongoose";

interface UserOverrides {
	name?: string;
	email?: string;
	password?: string;
	role?: UserRole;
	isActive?: boolean;
}

let counter = 0;
let courseCounter = 0;

/**
 * Insert a user with a real (model-hashed) password so login flows work in
 * tests. The User model's pre-save hook hashes the raw password.
 */
const createTestUser = async (overrides: UserOverrides = {}) => {
	counter += 1;
	return User.create({
		name: overrides.name ?? "Test User",
		email: overrides.email ?? `user-${counter}@example.com`,
		password: overrides.password ?? "Password123",
		role: overrides.role ?? "student",
		isActive: overrides.isActive ?? true,
	});
};

/** Create a session for a user; returns the doc + the raw token (cookie value). */
const createTestSession = async (
	userId: Types.ObjectId,
	overrides: Record<string, unknown> = {},
) => {
	const { token, tokenHash } = createSessionToken();
	const session = await Session.create({ userId, tokenHash, ...overrides });
	return { session, token };
};

const createTestCourse = (overrides: Record<string, unknown> = {}) => {
	courseCounter += 1;
	return Course.create({
		title: `Test Course ${courseCounter}`,
		slug: `test-course-${courseCounter}`,
		description: "A test course",
		instructorName: "Test Instructor",
		thumbnailUrl: "https://example.com/thumb.jpg",
		price: 49900,
		isPublished: true,
		learningOutcomes: [],
		...overrides,
	});
};

const createTestSection = (
	courseId: Types.ObjectId,
	overrides: Record<string, unknown> = {},
) => Section.create({ courseId, title: "Test Section", order: 0, ...overrides });

const createTestLesson = (
	sectionId: Types.ObjectId,
	courseId: Types.ObjectId,
	overrides: Record<string, unknown> = {},
) =>
	Lesson.create({
		sectionId,
		courseId,
		title: "Test Lesson",
		order: 0,
		...overrides,
	});

const createTestEnrollment = (
	userId: Types.ObjectId,
	courseId: Types.ObjectId,
	overrides: Record<string, unknown> = {},
) => Enrollment.create({ userId, courseId, ...overrides });

const createTestProgress = (
	userId: Types.ObjectId,
	lessonId: Types.ObjectId,
	courseId: Types.ObjectId,
	overrides: Record<string, unknown> = {},
) => Progress.create({ userId, lessonId, courseId, ...overrides });

export {
	createTestUser,
	createTestSession,
	createTestCourse,
	createTestSection,
	createTestLesson,
	createTestEnrollment,
	createTestProgress,
};

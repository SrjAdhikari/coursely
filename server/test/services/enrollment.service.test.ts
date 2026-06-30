//* test/services/enrollment.service.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import mongoose from "mongoose";

import {
	isEnrolled,
	createEnrollment,
	listMyEnrollments,
	listAllEnrollments,
} from "../../src/services/enrollment.service";
import Enrollment from "../../src/models/enrollment.model";
import {
	createTestUser,
	createTestCourse,
	createTestEnrollment,
} from "../helpers/factories";

describe("isEnrolled", () => {
	it("returns true when an enrollment exists", async () => {
		const userId = new mongoose.Types.ObjectId();
		const courseId = new mongoose.Types.ObjectId();
		await createTestEnrollment(userId, courseId);
		expect(await isEnrolled(userId.toString(), courseId.toString())).toBe(true);
	});

	it("returns false when no enrollment exists", async () => {
		expect(
			await isEnrolled(
				new mongoose.Types.ObjectId().toString(),
				new mongoose.Types.ObjectId().toString(),
			),
		).toBe(false);
	});
});

describe("createEnrollment", () => {
	it("creates a row on the first call and no-ops on the second (payment fields stamped once)", async () => {
		const userId = new mongoose.Types.ObjectId().toString();
		const courseId = new mongoose.Types.ObjectId().toString();

		const first = await createEnrollment({
			userId,
			courseId,
			stripeSessionId: "cs_first",
			amountPaid: 49900,
			currency: "INR",
		});
		const second = await createEnrollment({
			userId,
			courseId,
			stripeSessionId: "cs_second",
			amountPaid: 99900,
			currency: "USD",
		});

		expect(second!._id.toString()).toBe(first!._id.toString());
		expect(second!.stripeSessionId).toBe("cs_first");
		expect(second!.amountPaid).toBe(49900);
		expect(await Enrollment.countDocuments({ userId, courseId })).toBe(1);
	});
});

describe("createEnrollment — concurrent-insert race (E11000)", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	const buildDuplicateError = () => {
		const duplicateError = new mongoose.mongo.MongoServerError({
			message: "E11000 duplicate key",
		});
		duplicateError.code = 11000;
		return duplicateError;
	};

	it("absorbs the {userId,courseId} duplicate and returns the existing row", async () => {
		const userId = new mongoose.Types.ObjectId().toString();
		const courseId = new mongoose.Types.ObjectId().toString();
		const existingRow = { _id: new mongoose.Types.ObjectId(), userId, courseId };
		const duplicateError = buildDuplicateError();

		vi.spyOn(Enrollment, "findOneAndUpdate").mockReturnValue({
			lean: () => Promise.reject(duplicateError),
		} as unknown as ReturnType<typeof Enrollment.findOneAndUpdate>);
		vi.spyOn(Enrollment, "findOne").mockReturnValue({
			lean: () => Promise.resolve(existingRow),
		} as unknown as ReturnType<typeof Enrollment.findOne>);

		const result = await createEnrollment({ userId, courseId });
		expect(result).toBe(existingRow);
	});

	it("rethrows when the duplicate isn't the enrollment race (re-read misses)", async () => {
		const userId = new mongoose.Types.ObjectId().toString();
		const courseId = new mongoose.Types.ObjectId().toString();
		const duplicateError = buildDuplicateError();

		vi.spyOn(Enrollment, "findOneAndUpdate").mockReturnValue({
			lean: () => Promise.reject(duplicateError),
		} as unknown as ReturnType<typeof Enrollment.findOneAndUpdate>);
		vi.spyOn(Enrollment, "findOne").mockReturnValue({
			lean: () => Promise.resolve(null),
		} as unknown as ReturnType<typeof Enrollment.findOne>);

		await expect(createEnrollment({ userId, courseId })).rejects.toBe(
			duplicateError,
		);
	});
});

describe("listMyEnrollments", () => {
	it("returns the user's rows newest-first with the course summary populated", async () => {
		const user = await createTestUser();
		const courseA = await createTestCourse({ slug: "course-a", title: "Course A" });
		const courseB = await createTestCourse({ slug: "course-b", title: "Course B" });
		await createTestEnrollment(user._id, courseA._id);
		await createTestEnrollment(user._id, courseB._id);

		const rows = await listMyEnrollments(user._id.toString());
		expect(rows).toHaveLength(2);
		const course = rows[0]!.courseId as unknown as { title: string; slug: string };
		expect(course.title).toBeDefined();
		expect(course.slug).toBeDefined();
	});

	it("excludes other users' enrollments", async () => {
		const user = await createTestUser();
		const other = await createTestUser();
		const course = await createTestCourse();
		await createTestEnrollment(other._id, course._id);

		const rows = await listMyEnrollments(user._id.toString());
		expect(rows).toHaveLength(0);
	});
});

describe("listAllEnrollments", () => {
	it("paginates and reports totals", async () => {
		const user = await createTestUser();
		const courseA = await createTestCourse({ slug: "course-a" });
		const courseB = await createTestCourse({ slug: "course-b" });
		await createTestEnrollment(user._id, courseA._id);
		await createTestEnrollment(user._id, courseB._id);

		const firstPage = await listAllEnrollments(1, 1);
		expect(firstPage.items).toHaveLength(1);
		expect(firstPage.pagination).toEqual({
			page: 1,
			limit: 1,
			total: 2,
			totalPages: 2,
		});
	});
});

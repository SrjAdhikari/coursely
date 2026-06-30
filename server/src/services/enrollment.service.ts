//* src/services/enrollment.service.ts

import mongoose from "mongoose";
import Enrollment from "../models/enrollment.model";

/** Course summary fields surfaced on a student's My Courses list. */
const MY_COURSE_FIELDS =
	"title slug thumbnailUrl instructorName price currency";

interface CreateEnrollmentData {
	userId: string;
	courseId: string;
	stripeSessionId?: string;
	amountPaid?: number;
	currency?: string;
}

/**
 * Whether the user holds an enrollment for the course.
 *
 * @param userId - The user id.
 * @param courseId - The course id.
 * @returns True if an enrollment row exists for the pair.
 */
const isEnrolled = async (
	userId: string,
	courseId: string,
): Promise<boolean> => {
	const enrollment = await Enrollment.exists({ userId, courseId });
	const enrolled = enrollment !== null;
	return enrolled;
};

/**
 * Idempotently create an enrollment for a user+course. An atomic upsert means a
 * webhook/reconciliation race can neither double-insert nor clobber the payment
 * fields — `$setOnInsert` stamps them only on the first write; a later racer is a
 * no-op read of the existing row. The unique {userId,courseId} index is the hard
 * guarantee; on the rare concurrent-insert collision we catch E11000 and re-read.
 *
 * @param enrollmentData - The user/course ids plus the Stripe payment fields.
 * @returns The enrollment row (created or pre-existing).
 */
const createEnrollment = async (enrollmentData: CreateEnrollmentData) => {
	try {
		const enrollment = await Enrollment.findOneAndUpdate(
			{ userId: enrollmentData.userId, courseId: enrollmentData.courseId },
			{
				$setOnInsert: {
					userId: enrollmentData.userId,
					courseId: enrollmentData.courseId,
					stripeSessionId: enrollmentData.stripeSessionId,
					amountPaid: enrollmentData.amountPaid,
					currency: enrollmentData.currency,
				},
			},
			{
				upsert: true,
				returnDocument: "after",
				setDefaultsOnInsert: true,
				runValidators: true,
			},
		).lean();

		return enrollment;
	} catch (error) {
		// Concurrent webhook + reconciliation upserts can collide on the unique
		// index (Mongo upserts don't auto-retry). The row now exists — re-read it.
		const isDuplicateKey =
			error instanceof mongoose.mongo.MongoServerError && error.code === 11000;
		if (!isDuplicateKey) throw error;

		const existing = await Enrollment.findOne({
			userId: enrollmentData.userId,
			courseId: enrollmentData.courseId,
		}).lean();

		return existing;
	}
};

/**
 * List a student's enrollments, newest first, each with its course summary.
 *
 * @param userId - The student id.
 * @returns The student's enrollment rows with the course summary populated.
 */
const listMyEnrollments = async (userId: string) => {
	const enrollments = await Enrollment.find({ userId })
		.sort({ createdAt: -1 })
		.populate("courseId", MY_COURSE_FIELDS)
		.lean();

	return enrollments;
};

/**
 * List every enrollment, paginated and newest first, with the student and course
 * trimmed to the admin-table fields.
 *
 * @param page - 1-based page number.
 * @param limit - Page size.
 * @returns The page of enrollments plus `{ page, limit, total, totalPages }`.
 */
const listAllEnrollments = async (page: number, limit: number) => {
	const skip = (page - 1) * limit;
	const [items, total] = await Promise.all([
		Enrollment.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("userId", "name email")
			.populate("courseId", "title")
			.lean(),
		Enrollment.countDocuments(),
	]);

	const enrollmentsPage = {
		items,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};

	return enrollmentsPage;
};

export { isEnrolled, createEnrollment, listMyEnrollments, listAllEnrollments };

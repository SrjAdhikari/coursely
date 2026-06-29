//* src/services/enrollment.service.ts

import Enrollment from "../models/enrollment.model";

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
	return enrollment !== null;
};

export { isEnrolled };

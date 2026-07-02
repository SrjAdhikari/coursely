//* src/components/common/EnrolledCourseCard.tsx

import ROUTES from "@/routes/paths";
import { useCourseProgress } from "@/hooks/useProgress";
import CourseCard from "@/components/common/CourseCard";
import type { MyEnrollmentPayload } from "@/types/enrollment.types";

interface EnrolledCourseCardProps {
	enrollment: MyEnrollmentPayload;
}

/** A My Courses tile that links into the LearnPage; the CTA copy reflects
 * whether the learner has already started the course.
 */
const EnrolledCourseCard = ({ enrollment }: EnrolledCourseCardProps) => {
	const course = enrollment.courseId;
	const { data, isLoading } = useCourseProgress(course._id);

	const hasProgress =
		data?.data.some((row) => row.completed || row.positionSeconds > 0) ?? false;

	// No label until progress resolves — avoids a "Start learning"→"Continue" flicker.
	const ctaLabel = isLoading ? "" : hasProgress ? "Continue" : "Start learning";

	return (
		<CourseCard
			to={ROUTES.LEARN(course.slug)}
			title={course.title}
			instructorName={course.instructorName}
			thumbnailUrl={course.thumbnailUrl}
			badge="Enrolled"
			meta={
				ctaLabel ? (
					<span className="text-sm font-medium text-primary">{ctaLabel}</span>
				) : null
			}
		/>
	);
};

export default EnrolledCourseCard;

//* src/components/dashboard/CourseProgressRow.tsx

import { Link } from "react-router";

import ROUTES from "@/routes/paths";
import type { LearningCoursePayload } from "@/types/learning.types";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import pluralize from "@/lib/pluralize";

interface CourseProgressRowProps {
	course: LearningCoursePayload;
}

// The line under the progress bar, worded per the course's state.
const subLineFor = (course: LearningCoursePayload) => {
	if (course.state === "completed") return "All lessons complete";
	if (course.state === "not_started") return "Not started yet. Begin anytime";
	return course.nextLesson ? `Next: ${course.nextLesson.title}` : null;
};

const CourseProgressRow = ({ course }: CourseProgressRowProps) => {
	// Prefer deep-linking to the next lesson; fall back to the course entry.
	const resumeTo = course.nextLesson
		? ROUTES.LEARN_LESSON(course.slug, course.nextLesson.lessonId)
		: ROUTES.LEARN(course.slug);

	const subLine = subLineFor(course);

	return (
		<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
			{course.thumbnailUrl ? (
				<img
					src={course.thumbnailUrl}
					alt={course.title}
					loading="lazy"
					className="size-14 flex-none rounded-lg object-cover"
				/>
			) : (
				<div className="flex size-14 flex-none items-center justify-center rounded-lg bg-muted text-lg font-semibold">
					{course.title.charAt(0)}
				</div>
			)}

			<div className="min-w-0 flex-1">
				<h4 className="truncate font-heading text-base font-semibold">
					{course.title}
				</h4>
				<p className="text-xs text-muted-foreground">{course.instructorName}</p>

				<div className="mt-2 flex items-center gap-3">
					<Progress value={course.percentComplete} className="h-1.5 max-w-xs" />

					<span className="flex-none text-xs text-muted-foreground">
						{course.percentComplete}% · {course.completedLessons} /{" "}
						{pluralize(course.totalLessons, "lesson")}
					</span>
				</div>

				{subLine ? (
					<p className="mt-1.5 truncate text-xs text-muted-foreground">
						{subLine}
					</p>
				) : null}
			</div>

			{course.state === "completed" ? (
				<span className="flex-none rounded-md border border-accent-line bg-accent-soft px-3 py-1.5 text-xs font-medium text-primary">
					Completed ✓
				</span>
			) : (
				<Button asChild variant="outline" className="flex-none">
					<Link to={resumeTo}>
						{course.state === "not_started" ? "Start" : "Resume"}
					</Link>
				</Button>
			)}
		</div>
	);
};

export default CourseProgressRow;

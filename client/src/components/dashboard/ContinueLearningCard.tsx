//* src/components/dashboard/ContinueLearningCard.tsx

import { Link } from "react-router";
import { MoveRight } from "lucide-react";

import ROUTES from "@/routes/paths";
import type { LearningCoursePayload } from "@/types/learning.types";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ContinueLearningCardProps {
	courses: LearningCoursePayload[];
}

/** The in-progress course touched most recently that still has a next lesson. */
const pickResumeCourse = (courses: LearningCoursePayload[]) =>
	courses
		.filter(
			(course) =>
				course.state === "in_progress" &&
				course.nextLesson &&
				course.lastActivityAt,
		)
		.sort(
			(first, second) =>
				new Date(second.lastActivityAt!).getTime() -
				new Date(first.lastActivityAt!).getTime(),
		)[0] ?? null;

const ContinueLearningCard = ({ courses }: ContinueLearningCardProps) => {
	const course = pickResumeCourse(courses);
	if (!course || !course.nextLesson) return null;

	// First word of the title — a compact fallback when there's no cover image.
	const fallbackWord = course.title.split(" ")[0] ?? course.title;

	return (
		<section>
			<div className="mb-5">
				<span className="block text-xs uppercase tracking-widest text-primary">
					Continue learning
				</span>
				<h2 className="mt-2 font-heading text-2xl font-semibold">
					Pick up where you left off
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-linear-to-br from-muted to-card p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
				{course.thumbnailUrl ? (
					<img
						src={course.thumbnailUrl}
						alt={course.title}
						loading="lazy"
						className="h-30 w-full rounded-xl object-cover sm:w-50"
					/>
				) : (
					<div className="flex h-30 w-full items-center justify-center rounded-xl bg-muted px-4 sm:w-50">
						<span className="truncate font-heading text-3xl font-semibold">
							{fallbackWord}
						</span>
					</div>
				)}

				<div className="min-w-0">
					<span className="text-xs uppercase tracking-widest text-primary">
						Lesson {String(course.nextLesson.lessonNumber).padStart(2, "0")} ·{" "}
						{course.nextLesson.sectionTitle}
					</span>

					<h3 className="mt-2 font-heading text-xl font-semibold">
						{course.nextLesson.title}
					</h3>

					<div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
						<Progress
							value={course.percentComplete}
							className="h-1.5 max-w-52 flex-1"
						/>

						<span className="text-xs text-muted-foreground">
							{course.percentComplete}% · {course.title} ·{" "}
							{course.completedLessons} / {course.totalLessons} lessons
						</span>
					</div>
				</div>

				<Button asChild className="sm:justify-self-end">
					<Link
						to={ROUTES.LEARN_LESSON(course.slug, course.nextLesson.lessonId)}
					>
						Resume
						<MoveRight aria-hidden="true" className="size-4" />
					</Link>
				</Button>
			</div>
		</section>
	);
};

export default ContinueLearningCard;

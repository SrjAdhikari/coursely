//* src/components/dashboard/RecentlyWatched.tsx

import { Link } from "react-router";
import { CirclePlay } from "lucide-react";

import ROUTES from "@/routes/paths";
import { formatRelativeTime } from "@/lib/date";
import type { RecentLessonPayload } from "@/types/learning.types";

interface RecentlyWatchedProps {
	lessons: RecentLessonPayload[];
}

// Gradient colors for lessons without a thumbnail
const COVER_GRADIENTS = [
	"linear-gradient(135deg, #22d3ee, #0e7490)",
	"linear-gradient(135deg, #6ee7b7, #059669)",
	"linear-gradient(135deg, #3a8bff, #1452cc)",
	"linear-gradient(135deg, #c4b5fd, #7c3aed)",
];

const RecentlyWatched = ({ lessons }: RecentlyWatchedProps) => {
	if (lessons.length === 0) return null;

	return (
		<section>
			<h2 className="mb-4 font-heading text-xl font-semibold">
				Recently Watched
			</h2>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{lessons.map((lesson, index) => (
					<Link
						key={lesson.lessonId}
						to={ROUTES.LEARN_LESSON(lesson.courseSlug, lesson.lessonId)}
						className="group overflow-hidden rounded-xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-muted-foreground/40 hover:shadow-lg"
					>
						<div
							className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted"
							style={
								lesson.thumbnailUrl
									? undefined
									: {
											background:
												COVER_GRADIENTS[index % COVER_GRADIENTS.length],
										}
							}
						>
							{lesson.thumbnailUrl ? (
								<img
									src={lesson.thumbnailUrl}
									alt=""
									loading="lazy"
									className="absolute inset-0 size-full object-cover"
								/>
							) : null}

							<CirclePlay
								className="relative size-13 text-white drop-shadow-md transition duration-200 group-hover:text-primary"
								strokeWidth={1.5}
							/>
						</div>

						<div className="p-4">
							<h5 className="truncate text-sm font-semibold">{lesson.title}</h5>
							<p className="mt-1 truncate text-xs text-muted-foreground">
								{lesson.courseTitle}
							</p>

							<p className="mt-2 text-xs font-medium text-primary">
								{formatRelativeTime(lesson.updatedAt)}
							</p>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
};

export default RecentlyWatched;

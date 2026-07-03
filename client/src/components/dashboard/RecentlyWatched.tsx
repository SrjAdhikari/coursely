//* src/components/dashboard/RecentlyWatched.tsx

import { Link } from "react-router";
import { Play } from "lucide-react";

import ROUTES from "@/routes/paths";
import { formatRelativeTime } from "@/lib/date";
import type { RecentLessonPayload } from "@/types/learning.types";

interface RecentlyWatchedProps {
	lessons: RecentLessonPayload[];
}

const RecentlyWatched = ({ lessons }: RecentlyWatchedProps) => {
	if (lessons.length === 0) return null;

	return (
		<section>
			<h2 className="mb-4 font-heading text-xl font-semibold">Recently Watched</h2>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{lessons.map((lesson) => (
					<Link
						key={lesson.lessonId}
						to={ROUTES.LEARN_LESSON(lesson.courseSlug, lesson.lessonId)}
						className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-muted-foreground/40"
					>
						<div className="flex aspect-video items-center justify-center bg-muted">
							<span className="grid size-11 place-items-center rounded-full bg-background/50 text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
								<Play className="size-4" />
							</span>
						</div>
						<div className="p-4">
							<h5 className="truncate text-sm font-semibold">{lesson.title}</h5>
							<p className="mt-1 text-xs text-muted-foreground">
								{lesson.courseTitle} · {formatRelativeTime(lesson.updatedAt)}
							</p>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
};

export default RecentlyWatched;

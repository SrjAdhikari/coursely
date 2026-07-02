//* src/components/learn/CurriculumLessonRow.tsx

import { Link } from "react-router";

import ROUTES from "@/routes/paths";
import LessonStateIcon from "@/components/learn/LessonStateIcon";

import { formatLessonDuration } from "@/lib/duration";
import { cn } from "@/lib/utils";
import {
	lessonCompletionState,
	lessonWatchedFraction,
} from "@/lib/courseProgress";
import type { PublicLessonPayload } from "@/types/course.types";
import type { ProgressPayload } from "@/types/progress.types";

interface CurriculumLessonRowProps {
	courseSlug: string;
	lesson: PublicLessonPayload;
	progressRow: ProgressPayload | undefined;
	isCurrent: boolean;
}

/** One curriculum sidebar entry: state icon + title + duration, linked. */
const CurriculumLessonRow = ({
	courseSlug,
	lesson,
	progressRow,
	isCurrent,
}: CurriculumLessonRowProps) => {
	const state = lessonCompletionState(progressRow);

	return (
		<Link
			to={ROUTES.LEARN_LESSON(courseSlug, lesson._id)}
			aria-current={isCurrent ? "true" : undefined}
			className={cn(
				"flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
				isCurrent && "bg-primary/10 font-semibold text-foreground",
			)}
		>
			<LessonStateIcon
				state={state}
				watchedFraction={lessonWatchedFraction(progressRow, lesson.duration)}
			/>

			<span className="min-w-0 flex-1 leading-snug">{lesson.title}</span>

			<span className="shrink-0 text-xs text-muted-foreground">
				{formatLessonDuration(lesson.duration)}
			</span>
		</Link>
	);
};

export default CurriculumLessonRow;

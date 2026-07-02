//* src/components/learn/CurriculumSidebar.tsx

import { Progress } from "@/components/ui/progress";
import CurriculumLessonRow from "@/components/learn/CurriculumLessonRow";

import type { PublicSectionPayload } from "@/types/course.types";
import type { ProgressPayload } from "@/types/progress.types";

interface CurriculumSidebarProps {
	courseTitle: string;
	instructorName: string;
	courseSlug: string;
	sections: PublicSectionPayload[];
	progressByLesson: Map<string, ProgressPayload>;
	currentLessonId: string;
	overallPercent: number;
	completedCount: number;
	totalLessons: number;
}

/** Course header + overall progress + scrollable sections→lessons list. */
const CurriculumSidebar = ({
	courseTitle,
	instructorName,
	courseSlug,
	sections,
	progressByLesson,
	currentLessonId,
	overallPercent,
	completedCount,
	totalLessons,
}: CurriculumSidebarProps) => {
	return (
		<aside className="mt-6 lg:mt-0 lg:sticky lg:top-20 lg:w-90 lg:shrink-0">
			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
				<div className="border-b border-border p-4">
					<h2 className="font-heading text-lg leading-snug">{courseTitle}</h2>

					<p className="mt-1 text-sm text-muted-foreground">{instructorName}</p>

					<div className="mt-4">
						<Progress value={overallPercent} />
						<div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
							<span>
								{completedCount} of {totalLessons} lessons
							</span>

							<span className="font-medium text-primary">
								{overallPercent}% complete
							</span>
						</div>
					</div>
				</div>

				<div className="max-h-160 overflow-y-auto p-2">
					{sections.map((section) => (
						<div key={section._id}>
							<div className="px-3 pt-4 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
								{section.title}
							</div>

							{section.lessons.map((lesson) => (
								<CurriculumLessonRow
									key={lesson._id}
									courseSlug={courseSlug}
									lesson={lesson}
									progressRow={progressByLesson.get(lesson._id)}
									isCurrent={lesson._id === currentLessonId}
								/>
							))}
						</div>
					))}
				</div>
			</div>
		</aside>
	);
};

export default CurriculumSidebar;

//* src/components/course/CurriculumAccordion.tsx

import { Link } from "react-router";
import { Lock, PlayCircle } from "lucide-react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

import ROUTES from "@/routes/paths";
import { formatLessonDuration, formatRuntime } from "@/lib/duration";
import pluralize from "@/lib/pluralize";
import type { PublicSectionPayload } from "@/types/course.types";

interface CurriculumAccordionProps {
	sections: PublicSectionPayload[];
	slug: string;
}

/** Read-only curriculum: sections collapse to reveal preview/locked lessons.
 *  Preview lessons link to the anonymous preview player; locked lessons don't. */
const CurriculumAccordion = ({ sections, slug }: CurriculumAccordionProps) => {
	if (sections.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Curriculum coming soon.
			</p>
		);
	}

	// Open the sections that hold a free preview by default (they're the buy
	// hook); if none do, fall back to opening the first section.
	const previewSectionIds = sections
		.filter((section) => section.lessons.some((lesson) => lesson.isPreview))
		.map((section) => section._id);
	const defaultOpenSectionIds =
		previewSectionIds.length > 0 ? previewSectionIds : [sections[0]._id];

	return (
		<Accordion
			type="multiple"
			defaultValue={defaultOpenSectionIds}
			className="w-full space-y-3"
		>
			{sections.map((section) => {
				const lessonCount = section.lessons.length;
				const sectionSeconds = section.lessons.reduce(
					(total, lesson) => total + lesson.duration,
					0,
				);

				return (
					<AccordionItem
						key={section._id}
						value={section._id}
						className="rounded-lg border border-border bg-card px-4"
					>
						<AccordionTrigger className="hover:no-underline">
							<span className="flex flex-1 items-center justify-between gap-3 pr-3">
								<span className="font-medium">{section.title}</span>
								<span className="text-xs text-muted-foreground">
									{pluralize(lessonCount, "lesson")} ·{" "}
									{formatRuntime(sectionSeconds)}
								</span>
							</span>
						</AccordionTrigger>

						<AccordionContent>
							<ul className="divide-y divide-border">
								{section.lessons.map((lesson) => {
									const rowContent = (
										<>
											{lesson.isPreview ? (
												<PlayCircle
													aria-hidden
													className="size-4 text-primary"
												/>
											) : (
												<Lock
													aria-hidden
													className="size-4 text-muted-foreground"
												/>
											)}

											<span className="flex-1 text-sm">{lesson.title}</span>
											{lesson.isPreview ? (
												<Badge variant="accent">Preview</Badge>
											) : (
												<span className="text-xs text-muted-foreground">
													Enroll to unlock
												</span>
											)}

											<span className="text-xs text-muted-foreground">
												{formatLessonDuration(lesson.duration)}
											</span>
										</>
									);

									return (
										<li key={lesson._id}>
											{lesson.isPreview ? (
												<Link
													to={ROUTES.COURSE_PREVIEW(slug, lesson._id)}
													className="flex items-center gap-3 py-2.5 transition-colors hover:text-primary"
												>
													{rowContent}
												</Link>
											) : (
												<div className="flex items-center gap-3 py-2.5">
													{rowContent}
												</div>
											)}
										</li>
									);
								})}
							</ul>
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
};

export default CurriculumAccordion;

//* src/components/common/CourseCard.tsx

import type { ReactNode } from "react";
import { Link } from "react-router";

interface CourseCardProps {
	to: string;
	title: string;
	instructorName: string;
	thumbnailUrl: string;
	description?: string;
	badge?: string;
	category?: string;
	lessonCount?: number;
	meta: ReactNode;
}

/** Presentational course tile — the whole card links to `to`. Reused by the
 *  catalog and My Courses. */
const CourseCard = ({
	to,
	title,
	instructorName,
	thumbnailUrl,
	description,
	badge,
	category,
	lessonCount,
	meta,
}: CourseCardProps) => (
	<Link
		to={to}
		className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-input hover:shadow-lg"
	>
		<div className="relative aspect-video overflow-hidden bg-muted">
			<img src={thumbnailUrl} alt="" className="size-full object-cover" />
			{badge && (
				<span className="absolute right-2.5 top-2.5 rounded-full border border-primary/30 bg-card/90 px-2.5 py-1 text-xs text-primary">
					{badge}
				</span>
			)}
		</div>

		<div className="flex flex-1 flex-col p-4">
			<h3 className="font-heading text-base font-semibold leading-snug">
				{title}
			</h3>

			<div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
				<span
					aria-hidden
					className="size-5 shrink-0 rounded-full bg-linear-to-br from-primary to-primary/60"
				/>
				{instructorName}
			</div>

			{description && (
				<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
					{description}
				</p>
			)}

			{(category || typeof lessonCount === "number") && (
				<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					{category && (
						<span className="rounded-full border border-border px-2 py-0.5">
							{category}
						</span>
					)}

					{typeof lessonCount === "number" && (
						<span>
							{lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
						</span>
					)}
				</div>
			)}

			<div className="mt-4 flex items-center justify-end border-t border-border pt-3.5">
				<span className="text-base font-semibold text-foreground">{meta}</span>
			</div>
		</div>
	</Link>
);

export default CourseCard;

//* src/components/learn/LessonStateIcon.tsx

import { CircleCheck } from "lucide-react";
import type { LessonCompletionState } from "@/lib/courseProgress";

interface LessonStateIconProps {
	state: LessonCompletionState;
	watchedFraction?: number;
}

/**
 * The three-state completion marker in the curriculum sidebar:
 * empty circle (not-started), lime partial ring (in-progress), lime check (completed).
 */
const LessonStateIcon = ({
	state,
	watchedFraction = 0,
}: LessonStateIconProps) => {
	if (state === "completed") {
		return (
			<span
				data-state="completed"
				className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
			>
				<CircleCheck className="size-3" strokeWidth={3} aria-hidden />
			</span>
		);
	}

	if (state === "in-progress") {
		const percent = Math.round(watchedFraction * 100);
		return (
			<span
				data-state="in-progress"
				data-percent={percent}
				className="size-5 shrink-0 rounded-full"
				style={{
					background: `conic-gradient(var(--primary) ${percent}%, var(--border) ${percent}%)`,
					WebkitMask:
						"radial-gradient(closest-side, transparent 66%, #000 67%)",
					mask: "radial-gradient(closest-side, transparent 66%, #000 67%)",
				}}
			/>
		);
	}

	return (
		<span
			data-state="not-started"
			className="size-5 shrink-0 rounded-full border-2 border-input bg-transparent"
		/>
	);
};

export default LessonStateIcon;

//* src/lib/navigation.ts

import type {
	PublicSectionPayload,
	PublicLessonPayload,
} from "@/types/course.types";

/** Hard-redirect the browser to an external URL (e.g. Stripe Checkout). */
export const redirectTo = (url: string): void => {
	window.location.assign(url);
};

/** Find the next lesson in the course, or null if there is no next lesson. */
export const getNextLesson = (
	sections: PublicSectionPayload[],
	currentLessonId: string | undefined,
): PublicLessonPayload | null => {
	const orderedLessons = sections.flatMap((section) => section.lessons);
	const currentIndex = orderedLessons.findIndex(
		(lesson) => lesson._id === currentLessonId,
	);
	if (currentIndex === -1) return null;

	const nextLesson = orderedLessons[currentIndex + 1] ?? null;
	return nextLesson;
};

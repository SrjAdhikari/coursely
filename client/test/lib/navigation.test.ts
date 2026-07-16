//* test/lib/navigation.test.ts

import { describe, it, expect } from "vitest";

import { getNextLesson } from "@/lib/navigation";
import type {
	PublicSectionPayload,
	PublicLessonPayload,
} from "@/types/course.types";

const makeLesson = (
	id: string,
	sectionId: string,
	order: number,
): PublicLessonPayload => ({
	_id: id,
	sectionId,
	courseId: "course-1",
	title: `Lesson ${id}`,
	order,
	isPreview: false,
	duration: 300,
});

const makeSection = (
	id: string,
	order: number,
	lessons: PublicLessonPayload[],
): PublicSectionPayload => ({
	_id: id,
	courseId: "course-1",
	title: `Section ${id}`,
	order,
	lessons,
});

// Two sections in order: [s1 → l1, l2] then [s2 → l3].
const sections: PublicSectionPayload[] = [
	makeSection("s1", 1, [makeLesson("l1", "s1", 1), makeLesson("l2", "s1", 2)]),
	makeSection("s2", 2, [makeLesson("l3", "s2", 1)]),
];

describe("getNextLesson", () => {
	it("returns the next lesson within the same section", () => {
		expect(getNextLesson(sections, "l1")?._id).toBe("l2");
	});

	it("crosses into the next section when the current lesson is its section's last", () => {
		expect(getNextLesson(sections, "l2")?._id).toBe("l3");
	});

	it("returns null on the final lesson (no wrap-around)", () => {
		expect(getNextLesson(sections, "l3")).toBeNull();
	});

	it("returns null when the current lesson id is not in the curriculum", () => {
		expect(getNextLesson(sections, "missing")).toBeNull();
	});
});

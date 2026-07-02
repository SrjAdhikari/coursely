//* test/lib/courseProgress.test.ts

import { describe, it, expect } from "vitest";
import {
	indexProgressByLesson,
	lessonCompletionState,
	lessonWatchedFraction,
	courseCompletionPercent,
} from "@/lib/courseProgress";

describe("courseProgress helpers", () => {
	it("maps a lesson with no row to not-started", () => {
		expect(lessonCompletionState(undefined)).toBe("not-started");
	});

	it("maps an incomplete row to in-progress and a completed row to completed", () => {
		expect(
			lessonCompletionState({ lessonId: "l1", positionSeconds: 10, completed: false }),
		).toBe("in-progress");
		expect(
			lessonCompletionState({ lessonId: "l1", positionSeconds: 99, completed: true }),
		).toBe("completed");
	});

	it("computes the watched fraction, clamped to [0,1], guarding zero duration", () => {
		expect(
			lessonWatchedFraction({ lessonId: "l1", positionSeconds: 30, completed: false }, 120),
		).toBe(0.25);
		expect(
			lessonWatchedFraction({ lessonId: "l1", positionSeconds: 200, completed: false }, 120),
		).toBe(1);
		expect(lessonWatchedFraction(undefined, 120)).toBe(0);
		expect(
			lessonWatchedFraction({ lessonId: "l1", positionSeconds: 5, completed: false }, 0),
		).toBe(0);
	});

	it("rounds the overall completion percent and guards divide-by-zero", () => {
		expect(courseCompletionPercent(7, 12)).toBe(58);
		expect(courseCompletionPercent(0, 0)).toBe(0);
		expect(courseCompletionPercent(3, 3)).toBe(100);
	});

	it("indexes rows by lessonId", () => {
		const map = indexProgressByLesson([
			{ lessonId: "l1", positionSeconds: 10, completed: false },
			{ lessonId: "l2", positionSeconds: 0, completed: true },
		]);
		expect(map.get("l1")?.positionSeconds).toBe(10);
		expect(map.get("l2")?.completed).toBe(true);
	});
});

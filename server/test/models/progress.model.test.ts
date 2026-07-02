//* test/models/progress.model.test.ts

import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import Progress from "../../src/models/progress.model";

const ids = () => ({
	userId: new Types.ObjectId(),
	lessonId: new Types.ObjectId(),
	courseId: new Types.ObjectId(),
});

describe("Progress model", () => {
	it("requires userId, lessonId, and courseId", () => {
		const doc = new Progress({});
		const error = doc.validateSync();
		expect(error?.errors.userId).toBeDefined();
		expect(error?.errors.lessonId).toBeDefined();
		expect(error?.errors.courseId).toBeDefined();
	});

	it("defaults positionSeconds to 0, completed to false, and leaves completedAt unset", () => {
		const doc = new Progress(ids());
		expect(doc.positionSeconds).toBe(0);
		expect(doc.completed).toBe(false);
		expect(doc.completedAt).toBeUndefined();
	});

	it("rejects a negative positionSeconds", () => {
		const doc = new Progress({ ...ids(), positionSeconds: -1 });
		const error = doc.validateSync();
		expect(error?.errors.positionSeconds).toBeDefined();
	});

	it("declares a unique {userId,lessonId} index and a {userId,courseId} index", () => {
		const indexes: Array<
			[Record<string, unknown>, Record<string, unknown> | undefined]
		> = Progress.schema.indexes();
		const hasUniqueUserLesson = indexes.some(
			([fields, options]) =>
				fields.userId === 1 &&
				fields.lessonId === 1 &&
				options?.unique === true,
		);
		const hasUserCourse = indexes.some(
			([fields]) => fields.userId === 1 && fields.courseId === 1,
		);
		expect(hasUniqueUserLesson).toBe(true);
		expect(hasUserCourse).toBe(true);
	});
});

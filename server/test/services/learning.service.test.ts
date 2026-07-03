import { describe, it, expect } from "vitest";
import { getLearningOverview } from "../../src/services/learning.service";
import Progress from "../../src/models/progress.model";
import {
  createTestUser,
  createTestCourse,
  createTestSection,
  createTestLesson,
  createTestEnrollment,
  createTestProgress,
} from "../helpers/factories";

// Seed a course with `count` lessons in one section; returns the ordered lessons.
const seedCourse = async (opts: { lessonCount: number }) => {
  const course = await createTestCourse();
  const section = await createTestSection(course._id, { order: 0 });
  const lessons = [];
  for (let i = 0; i < opts.lessonCount; i++) {
    lessons.push(await createTestLesson(section._id, course._id, { order: i, title: `Lesson ${i}` }));
  }
  return { course, section, lessons };
};

describe("learning.service · getLearningOverview", () => {
  it("returns zeros / empty arrays when the user has no enrollments", async () => {
    const user = await createTestUser();
    const overview = await getLearningOverview(user._id.toString());
    expect(overview.stats).toEqual({
      enrolled: 0, inProgress: 0, completed: 0,
      lessonsCompleted: 0, totalLessons: 0, overallPercent: 0,
    });
    expect(overview.courses).toEqual([]);
    expect(overview.recentLessons).toEqual([]);
  });

  it("computes per-course counts, percent, state and the next incomplete lesson", async () => {
    const user = await createTestUser();
    const { course, lessons } = await seedCourse({ lessonCount: 4 });
    await createTestEnrollment(user._id, course._id);
    // complete lesson 0 only
    await createTestProgress(user._id, lessons[0]!._id, course._id, { completed: true });

    const overview = await getLearningOverview(user._id.toString());
    expect(overview.courses).toHaveLength(1);
    const row = overview.courses[0]!;
    expect(row.totalLessons).toBe(4);
    expect(row.completedLessons).toBe(1);
    expect(row.percentComplete).toBe(25);
    expect(row.state).toBe("in_progress");
    expect(row.lastActivityAt).not.toBeNull();
    expect(row.nextLesson).toMatchObject({ lessonId: lessons[1]!._id.toString() });
    expect(overview.stats).toMatchObject({ enrolled: 1, inProgress: 1, completed: 0, lessonsCompleted: 1 });
  });

  it("picks the next incomplete lesson respecting section then lesson order", async () => {
    const user = await createTestUser();
    const course = await createTestCourse();
    const secB = await createTestSection(course._id, { order: 1 });
    const secA = await createTestSection(course._id, { order: 0 });
    // create B's lesson first in the DB to prove ordering is by order fields, not insertion
    const b1 = await createTestLesson(secB._id, course._id, { order: 0, title: "B1" });
    const a1 = await createTestLesson(secA._id, course._id, { order: 0, title: "A1" });
    const a2 = await createTestLesson(secA._id, course._id, { order: 1, title: "A2" });
    await createTestEnrollment(user._id, course._id);
    await createTestProgress(user._id, a1._id, course._id, { completed: true });
    await createTestProgress(user._id, a2._id, course._id, { completed: true });

    const overview = await getLearningOverview(user._id.toString());
    expect(overview.courses[0]!.nextLesson).toMatchObject({ lessonId: b1._id.toString(), title: "B1" });
  });

  it("marks an enrolled course with no progress as not_started (next = first lesson)", async () => {
    const user = await createTestUser();
    const { course, lessons } = await seedCourse({ lessonCount: 3 });
    await createTestEnrollment(user._id, course._id);

    const overview = await getLearningOverview(user._id.toString());
    const row = overview.courses[0]!;
    expect(row.state).toBe("not_started");
    expect(row.completedLessons).toBe(0);
    expect(row.lastActivityAt).toBeNull();
    expect(row.nextLesson).toMatchObject({ lessonId: lessons[0]!._id.toString() });
  });

  it("marks a fully-watched course as completed with nextLesson null", async () => {
    const user = await createTestUser();
    const { course, lessons } = await seedCourse({ lessonCount: 2 });
    await createTestEnrollment(user._id, course._id);
    for (const lesson of lessons) {
      await createTestProgress(user._id, lesson._id, course._id, { completed: true });
    }
    const overview = await getLearningOverview(user._id.toString());
    expect(overview.courses[0]!.state).toBe("completed");
    expect(overview.courses[0]!.percentComplete).toBe(100);
    expect(overview.courses[0]!.nextLesson).toBeNull();
    expect(overview.stats).toMatchObject({ completed: 1, inProgress: 0 });
  });

  it("guards a course with zero lessons (percent 0, next null, not completed)", async () => {
    const user = await createTestUser();
    const course = await createTestCourse();
    await createTestEnrollment(user._id, course._id);
    const overview = await getLearningOverview(user._id.toString());
    const row = overview.courses[0]!;
    expect(row.totalLessons).toBe(0);
    expect(row.percentComplete).toBe(0);
    expect(row.state).toBe("not_started");
    expect(row.nextLesson).toBeNull();
    expect(overview.stats.completed).toBe(0);
  });

  it("returns recentLessons newest-first, limited to 4, joined to lesson + course", async () => {
    const user = await createTestUser();
    const { course, lessons } = await seedCourse({ lessonCount: 6 });
    await createTestEnrollment(user._id, course._id);
    // create rows, then stamp updatedAt in ascending order lessons[0]..[5]
    for (let i = 0; i < 6; i++) {
      const row = await createTestProgress(user._id, lessons[i]!._id, course._id, { positionSeconds: 5 });
      await Progress.collection.updateOne(
        { _id: row._id },
        { $set: { updatedAt: new Date(2026, 6, 1, 0, i) } }, // minute i => lessons[5] newest
      );
    }
    const overview = await getLearningOverview(user._id.toString());
    expect(overview.recentLessons).toHaveLength(4);
    expect(overview.recentLessons[0]!).toMatchObject({
      lessonId: lessons[5]!._id.toString(),
      title: "Lesson 5",
      courseTitle: course.title,
      courseSlug: course.slug,
    });
    // strictly descending order
    expect(overview.recentLessons.map((r) => r.lessonId)).toEqual([
      lessons[5]!._id.toString(), lessons[4]!._id.toString(),
      lessons[3]!._id.toString(), lessons[2]!._id.toString(),
    ]);
  });

  it("is caller-scoped — user A never sees user B's progress (IDOR)", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    const { course, lessons } = await seedCourse({ lessonCount: 3 });
    await createTestEnrollment(userA._id, course._id);
    await createTestEnrollment(userB._id, course._id);
    // B completes everything; A has nothing
    for (const lesson of lessons) {
      await createTestProgress(userB._id, lesson._id, course._id, { completed: true });
    }
    const overviewA = await getLearningOverview(userA._id.toString());
    expect(overviewA.courses[0]!.completedLessons).toBe(0);
    expect(overviewA.courses[0]!.state).toBe("not_started");
    expect(overviewA.recentLessons).toEqual([]);
  });
});

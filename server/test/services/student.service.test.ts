//* test/services/student.service.test.ts

import { describe, it, expect } from "vitest";
import mongoose from "mongoose";

import {
	listStudents,
	getStudentById,
	updateStudent,
} from "../../src/services/student.service";
import { createTestUser } from "../helpers/factories";

describe("student.service", () => {
	it("lists only student-role users and never the password", async () => {
		await createTestUser({ email: "s1@example.com", role: "student" });
		await createTestUser({ email: "admin@example.com", role: "admin" });

		const students = await listStudents();
		expect(students).toHaveLength(1);
		expect(students[0]!.email).toBe("s1@example.com");
		expect((students[0] as unknown as Record<string, unknown>).password).toBeUndefined();
	});

	it("gets a student by id", async () => {
		const user = await createTestUser({ email: "one@example.com" });
		const found = await getStudentById(user._id.toString());
		expect(found.email).toBe("one@example.com");
	});

	it("404s an unknown student id", async () => {
		await expect(
			getStudentById(new mongoose.Types.ObjectId().toString()),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "STUDENT_NOT_FOUND" });
	});

	it("toggles role and isActive", async () => {
		const user = await createTestUser({ email: "tog@example.com" });
		const updated = await updateStudent(user._id.toString(), {
			role: "admin",
			isActive: false,
		});
		expect(updated.role).toBe("admin");
		expect(updated.isActive).toBe(false);
	});

	it("404s updating an unknown student id", async () => {
		await expect(
			updateStudent(new mongoose.Types.ObjectId().toString(), { isActive: false }),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "STUDENT_NOT_FOUND" });
	});

	it("404s getting a non-student (admin) by id", async () => {
		const admin = await createTestUser({ email: "a@example.com", role: "admin" });
		await expect(
			getStudentById(admin._id.toString()),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "STUDENT_NOT_FOUND" });
	});

	it("404s updating a non-student (admin) by id", async () => {
		const admin = await createTestUser({ email: "a2@example.com", role: "admin" });
		await expect(
			updateStudent(admin._id.toString(), { isActive: false }),
		).rejects.toMatchObject({ statusCode: 404, errorCode: "STUDENT_NOT_FOUND" });
	});
});

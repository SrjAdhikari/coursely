//* tests/models/user.model.test.ts

import { describe, it, expect } from "vitest";
import User, { toPublicUser } from "../../src/models/user.model";

describe("User model", () => {
	it("lowercases/trims the email and defaults role=student, isActive=true", async () => {
		const user = await User.create({
			name: "Asha Rai",
			email: "  Asha@Example.COM ",
			password: "Password123",
		});
		expect(user.email).toBe("asha@example.com");
		expect(user.role).toBe("student");
		expect(user.isActive).toBe(true);
	});

	it("hashes the password on save (never stores plaintext)", async () => {
		await User.create({
			name: "Asha",
			email: "hash@example.com",
			password: "Password123",
		});
		const stored = await User.findOne({ email: "hash@example.com" }).select(
			"+password",
		);
		expect(stored?.password).toBeDefined();
		expect(stored?.password).not.toBe("Password123");
		expect(stored?.password?.startsWith("$2")).toBe(true); // bcrypt hash prefix
	});

	it("excludes password from default queries (select:false)", async () => {
		await User.create({
			name: "Asha",
			email: "sel@example.com",
			password: "Password123",
		});
		const found = await User.findOne({ email: "sel@example.com" });
		expect(found?.password).toBeUndefined();
	});

	it("comparePassword returns true for the correct password, false otherwise", async () => {
		await User.create({
			name: "Asha",
			email: "cmp@example.com",
			password: "Password123",
		});
		const user = await User.findOne({ email: "cmp@example.com" }).select(
			"+password",
		);
		expect(await user!.comparePassword("Password123")).toBe(true);
		expect(await user!.comparePassword("wrong")).toBe(false);
	});

	it("comparePassword returns false when the password was not selected", async () => {
		await User.create({
			name: "Asha",
			email: "noselect@example.com",
			password: "Password123",
		});
		const user = await User.findOne({ email: "noselect@example.com" }); // no +password
		expect(await user!.comparePassword("Password123")).toBe(false);
	});

	it("toPublicUser returns only id, name, email, role", async () => {
		const user = await User.create({
			name: "Asha",
			email: "pub@example.com",
			password: "Password123",
			role: "admin",
		});
		expect(toPublicUser(user)).toEqual({
			id: user._id.toString(),
			name: "Asha",
			email: "pub@example.com",
			role: "admin",
		});
	});
});

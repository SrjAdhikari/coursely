//* test/models/user.model.test.ts

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

	describe("name validation", () => {
		it.each([
			["all digits", "12313213"],
			["punctuation only", "..."],
			["an email address", "peyij91811@duvips.com"],
			["a name containing a period", "John A. Smith"],
			["a name with a double space", "Mary  Jane"],
			["a name starting with a special character", "'tHooft"],
		])("rejects a name that is %s", async (_label, name) => {
			// Rejected on validation, so the email is never persisted — safe to reuse.
			await expect(
				User.create({
					name,
					email: "reject-name@example.com",
					password: "Password123",
				}),
			).rejects.toThrow();
		});

		it.each([
			["accented / non-ASCII letters", "José Müller", "jose@example.com"],
			["an apostrophe", "O'Brien", "obrien@example.com"],
			["a hyphenated compound name", "Jean-Luc Picard", "jeanluc@example.com"],
		])("accepts %s", async (_label, name, email) => {
			const user = await User.create({ name, email, password: "Password123" });
			expect(user.name).toBe(name);
		});
	});

	describe("email validation", () => {
		it("accepts a well-formed email and rejects a malformed one", () => {
			const good = new User({
				name: "Asha Rai",
				email: "asha@example.com",
				password: "Password123",
			});
			expect(good.validateSync()?.errors.email).toBeUndefined();

			const bad = new User({
				name: "Asha Rai",
				email: "not-an-email",
				password: "Password123",
			});
			expect(bad.validateSync()?.errors.email).toBeDefined();
		});

		it("validates a backtracking-crafted email without catastrophic slowdown (m15 ReDoS)", () => {
			// No "@": forces a nested-quantifier regex to explore ~2^N splits before
			// failing. A linear pattern rejects it instantly; a ReDoS regex hangs.
			const redosPayload = "a".repeat(28);
			const user = new User({
				name: "Asha Rai",
				email: redosPayload,
				password: "Password123",
			});

			const start = performance.now();
			const error = user.validateSync();
			const elapsed = performance.now() - start;

			expect(error?.errors.email).toBeDefined();
			expect(elapsed).toBeLessThan(100);
		}, 30000);
	});
});

describe("user.model provider + avatarUrl", () => {
	it("creates a Google user with no password", async () => {
		const user = await User.create({
			name: "Asha Rai",
			email: "asha@example.com",
			provider: "google",
			avatarUrl: "https://lh3.googleusercontent.com/a/pic",
		});
		expect(user.provider).toBe("google");
		expect(user.avatarUrl).toBe("https://lh3.googleusercontent.com/a/pic");
		expect(user.password).toBeUndefined();
	});

	it("requires a password for an email-provider user", async () => {
		await expect(
			User.create({ name: "No Pass", email: "nopass@example.com" }),
		).rejects.toThrow(/password/i);
	});

	it("defaults provider to 'email'", async () => {
		const user = await User.create({
			name: "Pw User",
			email: "pw@example.com",
			password: "Password123",
		});
		expect(user.provider).toBe("email");
	});

	it("toPublicUser surfaces avatarUrl", () => {
		const publicUser = toPublicUser({
			_id: { toString: () => "abc" } as never,
			name: "Asha",
			email: "asha@example.com",
			role: "student",
			avatarUrl: "https://x/pic",
		});
		expect(publicUser.avatarUrl).toBe("https://x/pic");
	});
});

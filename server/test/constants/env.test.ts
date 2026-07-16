//* test/constants/env.test.ts

import { describe, it, expect, afterEach, vi } from "vitest";

const importEnv = () => import("../../src/constants/env");

describe("env COOKIE_SECRET validation", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it("throws when COOKIE_SECRET is one char short of 32", async () => {
		vi.stubEnv("COOKIE_SECRET", "x".repeat(31));
		vi.resetModules();
		await expect(importEnv()).rejects.toThrow(/COOKIE_SECRET/);
	});

	it("accepts a COOKIE_SECRET of at least 32 characters", async () => {
		vi.stubEnv("COOKIE_SECRET", "x".repeat(32));
		vi.resetModules();
		const { default: envConfig } = await importEnv();
		expect(envConfig.COOKIE_SECRET.length).toBeGreaterThanOrEqual(32);
	});
});

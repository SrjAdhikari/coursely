//* test/utils/token.test.ts

import { describe, it, expect } from "vitest";

import { createToken, hashToken } from "../../src/utils/token";

describe("token", () => {
	it("mints a high-entropy token whose hash matches hashToken", () => {
		const { token, tokenHash } = createToken();

		expect(typeof token).toBe("string");
		expect(token.length).toBeGreaterThanOrEqual(32);
		expect(tokenHash).toBe(hashToken(token));
	});

	it("never returns the raw token as its stored hash", () => {
		const { token, tokenHash } = createToken();
		expect(tokenHash).not.toBe(token);
	});

	it("produces a unique token on every call", () => {
		const first = createToken();
		const second = createToken();
		expect(first.token).not.toBe(second.token);
		expect(first.tokenHash).not.toBe(second.tokenHash);
	});

	it("hashes deterministically to a 64-char sha256 hex digest", () => {
		const hashed = hashToken("some-fixed-token");
		expect(hashed).toBe(hashToken("some-fixed-token"));
		expect(hashed).toMatch(/^[a-f0-9]{64}$/);
	});
});

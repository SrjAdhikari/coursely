//* test/utils/sessionToken.test.ts

import { describe, it, expect } from "vitest";

import {
	createSessionToken,
	hashSessionToken,
} from "../../src/utils/sessionToken";

describe("sessionToken", () => {
	it("mints a high-entropy token whose hash matches hashSessionToken", () => {
		const { token, tokenHash } = createSessionToken();

		expect(typeof token).toBe("string");
		expect(token.length).toBeGreaterThanOrEqual(32);
		expect(tokenHash).toBe(hashSessionToken(token));
	});

	it("never returns the raw token as its stored hash", () => {
		const { token, tokenHash } = createSessionToken();
		expect(tokenHash).not.toBe(token);
	});

	it("produces a unique token on every call", () => {
		const first = createSessionToken();
		const second = createSessionToken();
		expect(first.token).not.toBe(second.token);
		expect(first.tokenHash).not.toBe(second.tokenHash);
	});

	it("hashes deterministically to a 64-char sha256 hex digest", () => {
		const hashed = hashSessionToken("some-fixed-token");
		expect(hashed).toBe(hashSessionToken("some-fixed-token"));
		expect(hashed).toMatch(/^[a-f0-9]{64}$/);
	});
});

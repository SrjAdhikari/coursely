//* test/services/email.service.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import {
	sendVerificationEmail,
	sendPasswordResetEmail,
} from "../../src/services/email.service";

// The console transport is active in tests, so the dispatched email is
// readable straight off console.log — no provider mock needed.
const captureEmail = async (send: () => Promise<void>): Promise<string> => {
	const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	await send();

	return logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
};

describe("email service", () => {
	afterEach(() => vi.restoreAllMocks());

	it("sends the verification email to the address, not the name", async () => {
		const link = "http://localhost:5173/verify-email?token=raw123";
		const logged = await captureEmail(() =>
			sendVerificationEmail("Asha", "asha@example.com", link),
		);

		expect(logged).toContain("To: asha@example.com");
		expect(logged).toContain("Subject: Verify your email address");
		expect(logged).toContain("Hi Asha,");
		expect(logged).toContain(link);
	});

	it("sends the password reset email to the address, not the name", async () => {
		const link = "http://localhost:5173/reset-password?token=raw456";
		const logged = await captureEmail(() =>
			sendPasswordResetEmail("Asha", "asha@example.com", link),
		);

		expect(logged).toContain("To: asha@example.com");
		expect(logged).toContain("Subject: Reset your password");
		expect(logged).toContain(link);
	});
});

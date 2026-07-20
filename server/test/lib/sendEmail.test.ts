//* test/lib/sendEmail.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import sendEmail from "../../src/lib/sendEmail";

describe("sendEmail console transport (no RESEND_API_KEY)", () => {
	afterEach(() => vi.restoreAllMocks());

	it("logs the recipient, subject and body instead of calling Resend", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const link = "http://localhost:5173/verify-email?token=raw123";

		await sendEmail(
			"asha@example.com",
			"Verify your email address",
			`<p><a href="${link}">Verify my email</a></p>`,
		);

		expect(logSpy).toHaveBeenCalled();
		const logged = logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
		expect(logged).toContain("asha@example.com");
		expect(logged).toContain("Verify your email address");
		expect(logged).toContain(link);
	});
});

//* test/lib/sendEmail.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";

// The SMTP transport and the fail-closed gate are both decided at module-load
// time from env, so each test imports `sendEmail` fresh after stubbing NODE_ENV.
const loadSendEmail = async () => {
	const module = await import("../../src/lib/sendEmail");
	return module.default;
};

describe("sendEmail", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
		vi.restoreAllMocks();
	});

	it("logs the recipient, subject and body when SMTP is unconfigured in test env", async () => {
		const sendEmail = await loadSendEmail();
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

	it("fails closed — throws instead of logging the one-time link when unconfigured outside dev/test", async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.resetModules();

		const sendEmail = await loadSendEmail();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		await expect(
			sendEmail(
				"asha@example.com",
				"Reset your password",
				"<p>http://localhost:5173/reset-password?token=secret</p>",
			),
		).rejects.toThrow(/not configured/i);

		expect(logSpy).not.toHaveBeenCalled();
	});
});

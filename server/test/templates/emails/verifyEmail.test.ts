//* test/templates/emails/verifyEmail.test.ts

import { describe, it, expect } from "vitest";
import { VERIFY_EMAIL_TEMPLATE } from "../../../src/templates/emails";

const LINK = "https://example.com/verify-email?token=raw123";

// Markers that never appear in the static template — finding any of them in
// the output means an injected payload survived sanitization.
const DANGER = [
	"<script",
	"<svg",
	"<iframe",
	"onerror",
	"onload",
	"onclick",
	"alert(",
	"javascript:",
];

describe("VERIFY_EMAIL_TEMPLATE", () => {
	it("renders the recipient name, the verification link and the expiry notice", () => {
		const html = VERIFY_EMAIL_TEMPLATE("Asha", LINK);

		expect(html).toContain("Hi Asha,");
		expect(html).toContain(`href="${LINK}"`);
		expect(html).toContain("Verify my email");
		expect(html).toContain("expires in 24 hours");
	});

	it("neutralizes active-content payloads injected through the user name", () => {
		const html = VERIFY_EMAIL_TEMPLATE(
			'<img src=x onerror="alert(1)"><script>alert("xss")</script>',
			LINK,
		);

		for (const marker of DANGER) {
			expect(html.toLowerCase()).not.toContain(marker);
		}
	});

	it("strips markup from the user name while preserving its visible text", () => {
		const html = VERIFY_EMAIL_TEMPLATE("<b>Asha</b>", LINK);

		expect(html).toContain("Hi Asha,");
		expect(html).not.toContain("<b>Asha</b>");
	});
});

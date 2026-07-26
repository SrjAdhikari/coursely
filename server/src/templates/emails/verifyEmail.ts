//* src/templates/emails/verifyEmail.ts

import { layoutEmail } from "./_base";
import { ctaButton, infoCallout, paragraph } from "./_components";
import sanitizeInput from "../../utils/sanitizeInput";

/**
 * Email verification link sent during registration.
 *
 * @param userName - Recipient's display name
 * @param link - One-time verification URL
 * @returns Complete HTML email body
 */
const VERIFY_EMAIL_TEMPLATE = (userName: string, link: string): string => {
	const safeName = sanitizeInput(userName);

	return layoutEmail({
		preheader: "Confirm your email address to activate your account",
		title: "Verify your email address",
		bodyHtml: `
			<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: inherit;">Verify your email address</h1>
			${paragraph(`Hi ${safeName},`)}
			${paragraph("Please confirm your email address to activate your Manakuru account and start learning.")}
			${ctaButton(link, "Verify my email")}
			${infoCallout("This link expires in 24 hours. If you did not create a Manakuru account, you can safely ignore this email.")}
		`,
	});
};

export default VERIFY_EMAIL_TEMPLATE;

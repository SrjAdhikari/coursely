//* src/templates/emails/passwordReset.ts

import { layoutEmail } from "./_base";
import { ctaButton, infoCallout, paragraph } from "./_components";
import sanitizeInput from "../../utils/sanitizeInput";

/**
 * Password reset link. Fires during the forgot-password flow
 * when the user asks for a link to set a new password.
 *
 * @param userName - Recipient's display name
 * @param link - One-time password reset URL
 * @returns Complete HTML email body
 */
const PASSWORD_RESET_EMAIL_TEMPLATE = (
	userName: string,
	link: string,
): string => {
	const safeName = sanitizeInput(userName);

	return layoutEmail({
		preheader: "Use the link inside to choose a new password",
		title: "Reset your password",
		bodyHtml: `
			<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: inherit;">Reset your password</h1>
			${paragraph(`Hi ${safeName},`)}
			${paragraph("We received a request to reset your Manakuru password. Use the button below to choose a new one.")}
			${ctaButton(link, "Reset my password")}
			${infoCallout("This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.")}
		`,
	});
};

export default PASSWORD_RESET_EMAIL_TEMPLATE;

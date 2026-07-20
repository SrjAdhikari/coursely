//* src/services/email.service.ts

import sendEmail from "../lib/sendEmail";
import {
	PASSWORD_RESET_EMAIL_TEMPLATE,
	VERIFY_EMAIL_TEMPLATE,
} from "../templates/emails";

/**
 * Sends the account verification link to the user's email.
 *
 * @param name - The user's name
 * @param email - The user's email address
 * @param link - One-time verification URL
 */
const sendVerificationEmail = async (
	name: string,
	email: string,
	link: string,
): Promise<void> => {
	await sendEmail(
		email,
		"Verify your email address",
		VERIFY_EMAIL_TEMPLATE(name, link),
	);
};

/**
 * Sends the password reset link to the user's email.
 *
 * @param name - The user's name
 * @param email - The user's email address
 * @param link - One-time password reset URL
 */
const sendPasswordResetEmail = async (
	name: string,
	email: string,
	link: string,
): Promise<void> => {
	await sendEmail(
		email,
		"Reset your password",
		PASSWORD_RESET_EMAIL_TEMPLATE(name, link),
	);
};

export { sendVerificationEmail, sendPasswordResetEmail };

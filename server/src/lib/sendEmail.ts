//* src/lib/sendEmail.ts

import { Resend } from "resend";

import AppError from "../errors/AppError";

import envConfig from "../constants/env";
import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { RESEND_API_KEY, EMAIL_FROM } = envConfig;
const { INTERNAL_SERVER_ERROR } = httpStatus;
const { EMAIL_SEND_FAILED } = appErrorCode;

// No key configured (local dev / tests) means no client, so `sendEmail` falls
// back to a console transport instead of touching the network.
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Centralized utility for dispatching HTML emails using the Resend API.
 * Wraps external network calls in a try-catch to prevent unhandled node server crashes
 * if the Resend API undergoes downtime or DNS resolution fails.
 *
 * @param to - The recipient's email address
 * @param subject - The subject line of the email
 * @param html - The compiled HTML payload to send
 * @throws {AppError} If the HTTP request fails or Resend rejects the payload
 */
const sendEmail = async (
	to: string,
	subject: string,
	html: string,
): Promise<void> => {
	if (!resend) {
		console.log(`[email] To: ${to} | Subject: ${subject}\n${html}`);
		return;
	}

	try {
		const { error } = await resend.emails.send({
			from: EMAIL_FROM,
			to,
			subject,
			html,
		});

		// This catches API-level rejections (e.g., invalid email formats or domain bans)
		if (error) {
			console.error("Resend API Domain Error:", error);
			throw new AppError(
				"Failed to send email",
				INTERNAL_SERVER_ERROR,
				EMAIL_SEND_FAILED,
			);
		}
	} catch (err) {
		if (err instanceof AppError) throw err;

		// Network-level failures (DNS timeouts, Resend outages) that bypass the API response
		console.error("Critical Network Error dispatching email:", err);
		throw new AppError(
			"Internal gateway error. Could not dispatch email.",
			INTERNAL_SERVER_ERROR,
			EMAIL_SEND_FAILED,
		);
	}
};

export default sendEmail;

//* src/lib/sendEmail.ts

import nodemailer, { type Transporter } from "nodemailer";

import AppError from "../errors/AppError";

import envConfig from "../constants/env";
import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { NODE_ENV, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } =
	envConfig;
const { INTERNAL_SERVER_ERROR } = httpStatus;
const { EMAIL_SEND_FAILED } = appErrorCode;

/**
 * Create a reusable transporter object using the default SMTP transport
 * @returns {Transporter | null} The transporter object or null if credentials are missing
 */
const transporter: Transporter | null =
	SMTP_HOST && SMTP_USER && SMTP_PASS
		? nodemailer.createTransport({
				host: SMTP_HOST,
				port: SMTP_PORT,
				secure: SMTP_PORT === 465,
				requireTLS: SMTP_PORT !== 465,
				auth: { user: SMTP_USER, pass: SMTP_PASS },
			})
		: null;

const isConsoleFallbackAllowed =
	NODE_ENV === "development" || NODE_ENV === "test";

/**
 * Centralized utility for dispatching HTML emails over SMTP via Nodemailer.
 * Wraps the network call in a try-catch so a provider outage or DNS failure
 * surfaces as an `AppError` rather than crashing the node process.
 *
 * @param to - The recipient's email address
 * @param subject - The subject line of the email
 * @param html - The compiled HTML payload to send
 * @throws {AppError} If SMTP is unconfigured outside dev/test, or the send fails
 */
const sendEmail = async (
	to: string,
	subject: string,
	html: string,
): Promise<void> => {
	if (!transporter) {
		if (!isConsoleFallbackAllowed) {
			throw new AppError(
				"Email delivery is not configured",
				INTERNAL_SERVER_ERROR,
				EMAIL_SEND_FAILED,
			);
		}

		console.log(`[email] To: ${to} | Subject: ${subject}\n${html}`);
		return;
	}

	try {
		await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
	} catch (err) {
		console.error("Critical error dispatching email:", err);
		throw new AppError(
			"Internal gateway error. Could not dispatch email.",
			INTERNAL_SERVER_ERROR,
			EMAIL_SEND_FAILED,
		);
	}
};

export default sendEmail;

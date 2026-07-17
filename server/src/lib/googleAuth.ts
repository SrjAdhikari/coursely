//* src/lib/googleAuth.ts

import { OAuth2Client } from "google-auth-library";

import AppError from "../errors/AppError";

import envConfig from "../constants/env";
import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { GOOGLE_CLIENT_ID } = envConfig;
const { UNAUTHORIZED } = httpStatus;
const { INVALID_ID_TOKEN } = appErrorCode;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/** A Google identity, trusted only after the ID token's signature is verified. */
export interface GoogleIdentity {
	email: string;
	name: string;
	emailVerified: boolean;
	avatarUrl?: string;
}

/** Verify a Google ID token against Google's keys; return the identity or 401. */
const verifyGoogleIdToken = async (idToken: string): Promise<GoogleIdentity> => {
	try {
		const ticket = await client.verifyIdToken({
			idToken,
			audience: GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		if (!payload?.email) throw new Error("ID token has no email");

		return {
			email: payload.email.toLowerCase(),
			name: payload.name ?? payload.email,
			emailVerified: payload.email_verified === true,
			avatarUrl: payload.picture,
		};
	} catch {
		throw new AppError(
			"Could not verify your Google sign-in",
			UNAUTHORIZED,
			INVALID_ID_TOKEN,
		);
	}
};

export default verifyGoogleIdToken;

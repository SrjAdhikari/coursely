//* src/services/token.service.ts

import type { ClientSession, Types } from "mongoose";

import Token, { type TokenType } from "../models/token.model";
import { createToken, hashToken } from "../utils/token";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";
import { ONE_HOUR_MS, TWENTY_FOUR_HOURS_MS } from "../utils/date";

const { BAD_REQUEST } = httpStatus;
const { INVALID_OR_EXPIRED_TOKEN } = appErrorCode;

const TOKEN_TTL_MS: Record<TokenType, number> = {
	email_verification: TWENTY_FOUR_HOURS_MS,
	password_reset: ONE_HOUR_MS,
};

/**
 * Issue a one time use token of `type` for `userId`, 
 * deleting any previous tokens of the same type.
 */
const issueToken = async (
	userId: Types.ObjectId,
	type: TokenType,
): Promise<string> => {
	await Token.deleteMany({ userId, type });

	const { token, tokenHash } = createToken();
	const expiresAt = new Date(Date.now() + TOKEN_TTL_MS[type]);
	await Token.create({ userId, tokenHash, type, expiresAt });

	return token;
};

/**
 * Consume a one time use token of `type`, delete it and 
 * return the user ID. Throws 400 when missing/expired.
 */
const consumeToken = async (
	rawToken: string,
	type: TokenType,
	session?: ClientSession,
): Promise<Types.ObjectId> => {
	const tokenHash = hashToken(rawToken);
	const stored = await Token.findOneAndDelete(
		{ tokenHash, type, expiresAt: { $gt: new Date() } },
		{ session },
	);

	if (!stored) {
		throw new AppError(
			"This link is invalid or has expired",
			BAD_REQUEST,
			INVALID_OR_EXPIRED_TOKEN,
		);
	}

	return stored.userId;
};

export { issueToken, consumeToken };

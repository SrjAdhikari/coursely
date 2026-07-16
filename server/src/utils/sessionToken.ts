//* src/utils/sessionToken.ts

import { randomBytes, createHash } from "crypto";

const hashSessionToken = (token: string): string => {
	const tokenHash = createHash("sha256").update(token).digest("hex");
	return tokenHash;
};

const createSessionToken = (): { token: string; tokenHash: string } => {
	const token = randomBytes(32).toString("base64url");
	const tokenHash = hashSessionToken(token);
	return { token, tokenHash };
};

export { createSessionToken, hashSessionToken };

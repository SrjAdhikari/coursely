//* src/utils/token.ts

import { randomBytes, createHash } from "crypto";

const hashToken = (token: string): string => {
	const tokenHash = createHash("sha256").update(token).digest("hex");
	return tokenHash;
};

const createToken = (): { token: string; tokenHash: string } => {
	const token = randomBytes(32).toString("base64url");
	const tokenHash = hashToken(token);
	return { token, tokenHash };
};

export { createToken, hashToken };

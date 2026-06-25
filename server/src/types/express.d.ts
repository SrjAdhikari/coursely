//* src/types/express.d.ts

import type { PublicUser } from "../models/user.model";

declare global {
	namespace Express {
		interface Request {
			user?: PublicUser;
			sessionId?: string;
		}
	}
}

export {};

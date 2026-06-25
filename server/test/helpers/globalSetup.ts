//* test/helpers/globalSetup.ts

import { MongoMemoryReplSet } from "mongodb-memory-server";
import type { Vitest } from "vitest/node";

let mongo!: MongoMemoryReplSet;

// A single-node in-memory replica set (not a standalone server) so multi-document
// transactions work in tests — e.g. atomic user + session creation on register.
// Its URI is handed to the per-file setup via Vitest's provide/inject channel.
export default async function setup({ provide }: Vitest) {
	mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
	provide("mongoUri", mongo.getUri());

	return async () => {
		await mongo.stop();
	};
}

declare module "vitest" {
	interface ProvidedContext {
		mongoUri: string;
	}
}

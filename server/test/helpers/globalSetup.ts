//* test/helpers/globalSetup.ts

import { MongoMemoryServer } from "mongodb-memory-server";
import type { Vitest } from "vitest/node";

let mongo!: MongoMemoryServer;

// Starts one in-memory MongoDB for the whole test run and hands its URI to the
// per-file setup via Vitest's provide/inject channel.
export default async function setup({ provide }: Vitest) {
	mongo = await MongoMemoryServer.create();
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

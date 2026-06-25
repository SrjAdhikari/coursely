//* test/helpers/setup.ts

import { beforeAll, beforeEach, afterAll, inject } from "vitest";
import mongoose from "mongoose";

// Connect once per test file, wipe all collections between tests 
// (fast + keeps indexes intact), disconnect at the end.
beforeAll(async () => {
	if (mongoose.connection.readyState === 0) {
		await mongoose.connect(inject("mongoUri"));
	}
});

beforeEach(async () => {
	const { collections } = mongoose.connection;
	for (const key of Object.keys(collections)) {
		await collections[key]!.deleteMany({});
	}
});

afterAll(async () => {
	await mongoose.disconnect();
});

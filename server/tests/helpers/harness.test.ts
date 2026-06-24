//* tests/helpers/harness.test.ts

import { describe, it, expect } from "vitest";
import mongoose, { type Model } from "mongoose";

interface ProbeDoc {
	value: string;
}

// Ad-hoc probe model so this test depends on the harness, not on app models.
// Guard against OverwriteModelError when the file reloads in `vitest` watch mode.
const probeSchema = new mongoose.Schema<ProbeDoc>({ value: String });
const Probe: Model<ProbeDoc> =
	mongoose.models.Probe ?? mongoose.model<ProbeDoc>("Probe", probeSchema);

describe("in-memory mongo harness", () => {
	it("connects mongoose to the in-memory server", () => {
		expect(mongoose.connection.readyState).toBe(1); // 1 === connected
	});

	it("persists and reads a document", async () => {
		await Probe.create({ value: "hello" });
		const found = await Probe.findOne({ value: "hello" });
		expect(found?.value).toBe("hello");
	});
});

//* test/schemas/applyValidator.ts

import mongoose from "mongoose";

type Db = NonNullable<typeof mongoose.connection.db>;

// Create the collection if missing, then attach its $jsonSchema validator.
export const applyValidator = async (
	db: Db,
	name: string,
	schema: Record<string, unknown>,
) => {
	const existing = await db.listCollections({ name }).toArray();
	if (existing.length === 0) await db.createCollection(name);
	await db.command({
		collMod: name,
		validator: schema,
		validationLevel: "strict",
		validationAction: "error",
	});
};

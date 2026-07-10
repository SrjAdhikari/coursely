//* src/schemas/validateSchema.ts

import mongoose from "mongoose";
import connectToMongoDB from "../database/mongoDB";

import usersSchema from "./users.schema";
import coursesSchema from "./courses.schema";
import sectionsSchema from "./sections.schema";
import lessonsSchema from "./lessons.schema";
import enrollmentsSchema from "./enrollments.schema";
import progressesSchema from "./progresses.schema";

const collections = [
	{ name: "users", schema: usersSchema },
	{ name: "courses", schema: coursesSchema },
	{ name: "sections", schema: sectionsSchema },
	{ name: "lessons", schema: lessonsSchema },
	{ name: "enrollments", schema: enrollmentsSchema },
	{ name: "progresses", schema: progressesSchema },
];

/**
 * Validate all MongoDB collections against their respective schemas.
 * Creates non-existent collections and adds validation rules to existing ones.
 */
const validateSchema = async () => {
	try {
		await connectToMongoDB();

		const db = mongoose.connection.db;
		if (!db) throw new Error("Database connection is not ready");

		const collectionList = await db.listCollections().toArray();
		const existingCollections = collectionList.map(
			(collection) => collection.name,
		);

		for (const { name, schema } of collections) {
			try {
				if (!existingCollections.includes(name)) {
					await db.createCollection(name);
				}

				await db.command({
					collMod: name,
					validator: schema,
					validationLevel: "strict",
					validationAction: "error",
				});
				console.log(`✅ Validation added to ${name} collection`);
			} catch (error) {
				console.error(`❌ Validation failed for ${name} collection:`, error);
			}
		}
	} catch (error) {
		console.error("❌ Error [validateSchema]:", error);
	} finally {
		await mongoose.disconnect();
		console.log("👋️ MongoDB connection closed");
		process.exit(0);
	}
};

validateSchema();

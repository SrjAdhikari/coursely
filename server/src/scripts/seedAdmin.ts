//* src/scripts/seedAdmin.ts

/**
 * Create an admin account, or promote an existing user to admin.
 *
 * Usage:
 *   npm run seed:admin -- --email=admin@example.com --password=StrongPass123
 *
 * Idempotent: if the email already exists it is promoted to admin and the
 * password argument is ignored.
 */

import mongoose from "mongoose";

import connectToMongoDB from "../database/mongoDB";
import User from "../models/user.model";

const readArg = (prefix: string): string | undefined => {
	const match = process.argv.find((arg) => arg.startsWith(prefix));
	return match?.slice(prefix.length).trim();
};

const seedAdmin = async () => {
	const email = readArg("--email=")?.toLowerCase();
	const password = readArg("--password=");
	const name = readArg("--name=") ?? "Admin";

	if (!email) {
		console.error(
			"Usage: npm run seed:admin -- --email=user@example.com --password=StrongPass123",
		);
		process.exit(1);
	}

	await connectToMongoDB();

	try {
		const alreadyExists = await User.exists({ email });

		if (alreadyExists) {
			await User.updateOne({ email }, { $set: { role: "admin" } });
			console.log(`✅ Promoted ${email} to admin`);
		} else if (!password) {
			console.error(
				"❌ A --password is required to create a new admin account",
			);
			process.exitCode = 1;
		} else {
			await User.create({
				name,
				email,
				password,
				role: "admin",
				isActive: true,
			});
			console.log(`✅ Created admin account ${email}`);
		}
	} catch (error) {
		console.error("❌ Failed to seed admin:", error);
		process.exitCode = 1;
	} finally {
		await mongoose.disconnect();
	}
};

seedAdmin();

//* src/database/mongo.ts

import mongoose from "mongoose";
import envConfig from "../constants/env";

const { MONGODB_URI } = envConfig;

// Connect to MongoDB database
const connectToMongoDB = async (): Promise<void> => {
	try {
		console.log("🔄️ Connecting to MongoDB...");
		await mongoose.connect(MONGODB_URI);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`❌ MongoDB connection failed: ${message}`);
		process.exit(1);
	}
};

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
	await mongoose.disconnect();
	console.log("👋️ MongoDB connection closed");
	process.exit(0);
};

// Handle SIGINT (Ctrl+C) and SIGTERM (cloud providers stop)
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default connectToMongoDB;

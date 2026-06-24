//* src/server.ts

import app from "./src/app";
import envConfig from "./src/constants/env";
import connectToMongoDB from "./src/database/mongoDB";

const { PORT, NODE_ENV } = envConfig;

/** Starts the Express server after connecting to MongoDB */
const startServer = async (): Promise<void> => {
	try {
		await connectToMongoDB();
		console.log("✅ Database connected successfully");

		app.listen(PORT, () => {
			console.log(
				`🚀 Server is running on http://localhost:${PORT} in ${NODE_ENV} environment.`,
			);
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
};

startServer();

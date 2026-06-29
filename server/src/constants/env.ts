//* src/config/env.ts

import { config } from "dotenv";

// Load variables from `.env` (default path).
// If you keep secrets elsewhere, pass { path: "..." }.
config();

// Read a required environment variable; throw early if it is missing.
const getEnv = (key: string): string => {
	const value = process.env[key];

	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not defined`);
	}

	return value;
};

const envConfig = Object.freeze({
	NODE_ENV: getEnv("NODE_ENV"),
	PORT: Number(getEnv("PORT")),
	MONGODB_URI: getEnv("MONGODB_URI"),
	COOKIE_SECRET: getEnv("COOKIE_SECRET"),
	APP_ORIGIN: getEnv("APP_ORIGIN"),
	R2_ACCOUNT_ID: getEnv("R2_ACCOUNT_ID"),
	R2_ACCESS_KEY_ID: getEnv("R2_ACCESS_KEY_ID"),
	R2_SECRET_ACCESS_KEY: getEnv("R2_SECRET_ACCESS_KEY"),
	R2_BUCKET: getEnv("R2_BUCKET"),
});

export default envConfig;

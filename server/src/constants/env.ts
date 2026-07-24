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

// Read a required secret and enforce a minimum length (entropy floor).
const getSecret = (key: string, minLength: number): string => {
	const value = getEnv(key);

	if (value.length < minLength) {
		throw new Error(
			`Environment variable ${key} must be at least ${minLength} characters`,
		);
	}

	return value;
};

const envConfig = Object.freeze({
	NODE_ENV: getEnv("NODE_ENV"),
	PORT: Number(getEnv("PORT")),
	MONGODB_URI: getEnv("MONGODB_URI"),
	COOKIE_SECRET: getSecret("COOKIE_SECRET", 32),
	APP_ORIGIN: getEnv("APP_ORIGIN"),
	GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
	R2_ACCOUNT_ID: getEnv("R2_ACCOUNT_ID"),
	R2_ACCESS_KEY_ID: getEnv("R2_ACCESS_KEY_ID"),
	R2_SECRET_ACCESS_KEY: getEnv("R2_SECRET_ACCESS_KEY"),
	R2_BUCKET: getEnv("R2_BUCKET"),
	STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY"),
	STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),
	EMAIL_FROM: getEnv("EMAIL_FROM"),
	SMTP_HOST: getEnv("SMTP_HOST"),
	SMTP_PORT: Number(getEnv("SMTP_PORT")),
	SMTP_USER: getEnv("SMTP_USER"),
	SMTP_PASS: getEnv("SMTP_PASS"),
});

export default envConfig;

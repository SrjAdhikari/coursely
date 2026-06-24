import { defineConfig } from "vitest/config";

// Inject safe test env so importing `app` never needs a real DB or a `.env`
// file. The app module loads `config/env` (zod-validated) at import time; these
// values satisfy that schema without touching Atlas. The richer in-memory
// replica-set harness (globalSetup/setup) arrives with the first models.
export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		env: {
			NODE_ENV: "test",
			PORT: "8080",
			MONGODB_URI: "mongodb://127.0.0.1:27017/coursely-test",
			COOKIE_SECRET: "test-cookie-secret-0123456789",
			APP_ORIGIN: "http://localhost:5173",
		},
		include: ["tests/**/*.test.ts"],
	},
});

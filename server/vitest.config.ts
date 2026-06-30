import { defineConfig } from "vitest/config";

/**
 * Inject a safe test env so importing `app` never needs a real DB or a `.env`
 * file — env vars are read at import time. The in-memory MongoDB harness
 * (globalSetup/setup) provides the actual test database.
 */
export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		fileParallelism: false,
		env: {
			NODE_ENV: "test",
			PORT: "8080",
			MONGODB_URI: "mongodb://127.0.0.1:27017/coursely-test",
			COOKIE_SECRET: "test-cookie-secret-0123456789",
			APP_ORIGIN: "http://localhost:5173",
			R2_ACCOUNT_ID: "test-account",
			R2_ACCESS_KEY_ID: "test-access-key",
			R2_SECRET_ACCESS_KEY: "test-secret-key",
			R2_BUCKET: "coursely-test",
			STRIPE_SECRET_KEY: "sk_test_dummy_key_for_unit_tests",
			STRIPE_WEBHOOK_SECRET: "whsec_test_dummy_secret_for_signing",
		},
		include: ["test/**/*.test.ts"],
		globalSetup: ["./test/helpers/globalSetup.ts"],
		setupFiles: ["./test/helpers/setup.ts"],
	},
});

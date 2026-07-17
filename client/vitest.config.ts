//* vitest.config.ts

import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: { "@": path.resolve(import.meta.dirname, "./src") },
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./test/setup.ts"],
		include: ["test/**/*.test.{ts,tsx}"],
		// Hermetic API base URL so tests that import axiosClient don't depend on
		// the gitignored .env.local (keeps CI green without secrets).
		env: {
			VITE_API_URL: "http://localhost:8080/api",
			VITE_GOOGLE_CLIENT_ID: "test-google-client-id.apps.googleusercontent.com",
		},
	},
});

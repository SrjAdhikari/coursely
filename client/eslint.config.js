import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	globalIgnores(["dist", "coverage"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
	},
	// shadcn-generated primitives export variants alongside the component,
	// which trips react-refresh; that's expected for these files.
	{
		files: ["src/components/ui/**/*.{ts,tsx}"],
		rules: {
			"react-refresh/only-export-components": "off",
		},
	},
	// Vitest globals for the test files under test/.
	{
		files: ["test/**/*.{ts,tsx}"],
		languageOptions: {
			globals: {
				describe: "readonly",
				it: "readonly",
				test: "readonly",
				expect: "readonly",
				beforeAll: "readonly",
				beforeEach: "readonly",
				afterAll: "readonly",
				afterEach: "readonly",
				vi: "readonly",
			},
		},
	},
]);

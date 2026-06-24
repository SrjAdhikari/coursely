import { defineConfig } from "tsup";

// Bundles the API entrypoint to a runnable ESM artifact in `dist/`. Deploy
// still runs `tsx server.ts`; this build is a CI integrity gate (proves the
// project bundles cleanly). esbuild resolves the extensionless imports that a
// plain `tsc` emit would leave unresolvable under Node's ESM loader.
export default defineConfig({
	entry: ["server.ts"],
	format: ["esm"],
	target: "node20",
	outDir: "dist",
	clean: true,
	sourcemap: true,
});

//* src/hooks/useTheme.ts

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

/** Reads the stored theme, defaulting to dark (the app's default). */
const getStoredTheme = (): Theme =>
	localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";

/** Toggles the `.dark` class on <html> to match the theme. */
const applyTheme = (theme: Theme) => {
	document.documentElement.classList.toggle("dark", theme === "dark");
};

/** Stable external-store subscription (module-scoped — captures nothing). */
const subscribe = (callback: () => void) => {
	window.addEventListener("storage", callback);
	return () => window.removeEventListener("storage", callback);
};

// Apply the stored theme on first import. Client-only: touches document /
// localStorage at module load (the app never server-renders).
applyTheme(getStoredTheme());

/**
 * Read and toggle the light/dark theme. Persisted to localStorage and applied
 * to <html> via the `.dark` class. Uses `useSyncExternalStore` so every mounted
 * consumer (and other tabs) stays in sync.
 */
const useTheme = () => {
	const theme = useSyncExternalStore(subscribe, getStoredTheme);

	const setTheme = useCallback((next: Theme) => {
		localStorage.setItem(STORAGE_KEY, next);
		applyTheme(next);
		window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
	}, []);

	const toggleTheme = useCallback(
		() => setTheme(getStoredTheme() === "dark" ? "light" : "dark"),
		[setTheme],
	);

	return { theme, setTheme, toggleTheme };
};

export default useTheme;

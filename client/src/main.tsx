//* src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import queryClient from "@/config/queryClient";
import App from "@/App";
import "./index.css";

/**
 * App entry point — wires the global providers and renders the app.
 * Providers: React Query (server state), BrowserRouter (routing), Sonner (toasts).
 */
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<App />
				<Toaster richColors position="top-center" />
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);

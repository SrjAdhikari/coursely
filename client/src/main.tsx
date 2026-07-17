//* src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

import queryClient from "@/config/queryClient";
import { GOOGLE_CLIENT_ID } from "@/lib/constants";
import App from "@/App";
import "./index.css";

if (!GOOGLE_CLIENT_ID) {
	throw new Error("VITE_GOOGLE_CLIENT_ID is not defined in .env file");
}

/**
 * App entry point — wires the global providers and renders the app.
 * Providers: React Query (server state), BrowserRouter (routing), Sonner (toasts).
 */
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
					<App />
					<Toaster richColors position="top-right" />
				</GoogleOAuthProvider>
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);

//* src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router";

import ROUTES from "@/routes/paths";
import HomePage from "@/pages/HomePage";

/**
 * Central route definitions. Only the public Home route exists in Phase 1;
 * auth, catalog, dashboard, and admin routes (with guards) land in later phases.
 */
const AppRoutes = () => {
	return (
		<Routes>
			<Route path={ROUTES.ROOT} element={<HomePage />} />
		</Routes>
	);
};

export default AppRoutes;

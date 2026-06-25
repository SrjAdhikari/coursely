//* src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router";

import ROUTES from "@/routes/paths";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminPage from "@/pages/AdminPage";
import GuestRoute from "@/routes/GuestRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";

/** Central route definitions with auth guards. */
const AppRoutes = () => {
	return (
		<Routes>
			<Route path={ROUTES.ROOT} element={<HomePage />} />

			{/* Logged-out only */}
			<Route element={<GuestRoute />}>
				<Route path={ROUTES.LOGIN} element={<LoginPage />} />
				<Route path={ROUTES.REGISTER} element={<RegisterPage />} />
			</Route>

			{/* Authenticated */}
			<Route element={<ProtectedRoute />}>
				<Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

				{/* Admin only */}
				<Route element={<AdminRoute />}>
					<Route path={ROUTES.ADMIN} element={<AdminPage />} />
				</Route>
			</Route>
		</Routes>
	);
};

export default AppRoutes;

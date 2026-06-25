//* src/routes/GuestRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import Loader from "@/components/Loader";
import ROUTES from "@/routes/paths";

/**
 * Route guard for logged-out-only pages (login, register). Redirects an already
 * authenticated user to their role's home (admin → /admin, student → /dashboard).
 * Shows a full-screen loader while the auth check is in flight.
 */
const GuestRoute = () => {
	const { data, isLoading } = useCurrentUser();

	if (isLoading) return <Loader />;
	if (data) {
		const home = data.data.role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD;
		return <Navigate to={home} replace />;
	}

	return <Outlet />;
};

export default GuestRoute;

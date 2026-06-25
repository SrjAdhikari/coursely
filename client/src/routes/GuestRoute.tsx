//* src/routes/GuestRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import Loader from "@/components/Loader";
import ROUTES from "@/routes/paths";

/**
 * Route guard for logged-out-only pages (login, register). Redirects an already
 * authenticated user to the dashboard. Shows a full-screen loader while the
 * auth check is in flight.
 */
const GuestRoute = () => {
	const { data, isLoading } = useCurrentUser();

	if (isLoading) return <Loader />;
	if (data) return <Navigate to={ROUTES.DASHBOARD} replace />;

	return <Outlet />;
};

export default GuestRoute;

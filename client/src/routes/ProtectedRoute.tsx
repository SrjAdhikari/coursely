//* src/routes/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import Loader from "@/components/Loader";
import ROUTES from "@/routes/paths";

/**
 * Route guard for authenticated users. Renders the child routes when a session
 * is present, otherwise redirects to login with a `?redirect` back to the page
 * they tried to reach (so login returns them there). Shows a full-screen loader
 * while the `/auth/me` check is in flight.
 */
const ProtectedRoute = () => {
	const { data, isLoading, isError } = useCurrentUser();
	const location = useLocation();

	if (isLoading) return <Loader />;
	if (isError || !data) {
		const returnTo = encodeURIComponent(
			`${location.pathname}${location.search}`,
		);
		return <Navigate to={`${ROUTES.LOGIN}?redirect=${returnTo}`} replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;

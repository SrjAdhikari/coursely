//* src/routes/ProtectedRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import Loader from "@/components/Loader";
import ROUTES from "@/routes/paths";

/**
 * Route guard for authenticated users. Renders the child routes when a session
 * is present, otherwise redirects to the login page. Shows a full-screen loader
 * while the `/auth/me` check is in flight.
 */
const ProtectedRoute = () => {
	const { data, isLoading, isError } = useCurrentUser();

	if (isLoading) return <Loader />;
	if (isError || !data) return <Navigate to={ROUTES.LOGIN} replace />;

	return <Outlet />;
};

export default ProtectedRoute;

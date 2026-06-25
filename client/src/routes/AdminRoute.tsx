//* src/routes/AdminRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import Loader from "@/components/Loader";
import ROUTES from "@/routes/paths";

/**
 * Route guard for admin-only pages. Redirects unauthenticated
 * visitors to login and signed-in non-admins to the dashboard.
 */
const AdminRoute = () => {
	const { data, isLoading, isError } = useCurrentUser();

	if (isLoading) return <Loader />;
	if (isError || !data) return <Navigate to={ROUTES.LOGIN} replace />;

	if (data.data.role !== "admin") {
		return <Navigate to={ROUTES.DASHBOARD} replace />;
	}

	return <Outlet />;
};

export default AdminRoute;

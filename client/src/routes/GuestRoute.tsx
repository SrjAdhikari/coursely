//* src/routes/GuestRoute.tsx

import { Navigate, Outlet, useSearchParams } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import Loader from "@/components/Loader";
import ROUTES from "@/routes/paths";

/** A redirect target is safe only if it's an app-internal absolute path. */
const safeRedirect = (target: string | null): string | null => {
	if (!target || !target.startsWith("/") || target.startsWith("//")) return null;
	return target;
};

/**
 * Route guard for logged-out-only pages (login, register). Redirects an already
 * authenticated user to a safe `?redirect` target if present, otherwise to their
 * role's home (admin → /admin, student → /dashboard). Shows a full-screen loader
 * while the auth check is in flight.
 */
const GuestRoute = () => {
	const { data, isLoading } = useCurrentUser();
	const [params] = useSearchParams();

	if (isLoading) return <Loader />;
	if (data) {
		const roleHome =
			data.data.role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD;
		const target = safeRedirect(params.get("redirect")) ?? roleHome;
		return <Navigate to={target} replace />;
	}

	return <Outlet />;
};

export default GuestRoute;

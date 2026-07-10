//* src/components/layout/AuthLayout.tsx

import { Outlet, Link } from "react-router";

import ROUTES from "@/routes/paths";
import AppLogo from "@/components/common/AppLogo";
import { Button } from "@/components/ui/button";

/** Minimal chrome for the auth pages: a brand + catalog-link header over a
 *  centered card slot, so a direct-landing visitor always has a way back. */
const AuthLayout = () => (
	<div className="relative z-10 flex min-h-screen flex-col">
		<header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
				<Link to={ROUTES.ROOT}>
					<AppLogo className="text-lg" />
				</Link>

				<Button asChild variant="ghost">
					<Link to={ROUTES.CATALOG}>Browse courses</Link>
				</Button>
			</div>
		</header>

		<main className="flex grow items-center justify-center px-5 py-10">
			<Outlet />
		</main>
	</div>
);

export default AuthLayout;

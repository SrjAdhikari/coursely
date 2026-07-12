//* src/components/layout/store/StoreHeader.tsx

import { Link, NavLink } from "react-router";

import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import AppLogo from "@/components/common/AppLogo";
import UserMenu from "@/components/common/UserMenu";
import ThemeToggle from "@/components/theme/theme-toggle";
import ROUTES from "@/routes/paths";

// Ghost-button-style nav item; the active route gets a muted pill + primary text.
const navItemClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"whitespace-nowrap rounded-md px-3 py-1.5 transition-colors",
		isActive
			? "bg-muted text-primary"
			: "text-muted-foreground hover:text-primary",
	);

/** Minimal shared header for the store pages (a fuller public header comes later). */
const StoreHeader = () => {
	const { data } = useCurrentUser();
	const user = data?.data;

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
			<div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5">
				<Link to={user ? ROUTES.DASHBOARD : ROUTES.ROOT}>
					<AppLogo iconClassName="size-8" />
				</Link>

				<div className="flex items-center gap-7">
					<nav className="flex items-center gap-2 text-sm">
						<NavLink to={ROUTES.CATALOG} className={navItemClass}>
							Browse
						</NavLink>

						{user ? (
							<>
								<NavLink to={ROUTES.DASHBOARD} className={navItemClass}>
									Dashboard
								</NavLink>

								<NavLink to={ROUTES.MY_COURSES} className={navItemClass}>
									My Courses
								</NavLink>
							</>
						) : (
							<>
								<Button asChild variant="ghost">
									<Link to={ROUTES.LOGIN}>Log in</Link>
								</Button>

								<Button asChild>
									<Link to={ROUTES.REGISTER}>Sign up</Link>
								</Button>
							</>
						)}
					</nav>

					{/* Account + theme controls, avatar separated from the toggle. */}
					<div className="flex items-center gap-3">
						{user ? (
							<>
								<UserMenu user={user} />

								<span
									className="h-5 w-px bg-border"
									aria-hidden
								/>
							</>
						) : null}

						<ThemeToggle />
					</div>
				</div>
			</div>
		</header>
	);
};

export default StoreHeader;

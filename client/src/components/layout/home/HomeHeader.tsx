//* src/components/layout/home/HomeHeader.tsx

import { Link, NavLink } from "react-router";

import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useAuth";
import ROUTES from "@/routes/paths";

import { Button } from "@/components/ui/button";
import AppLogo from "@/components/common/AppLogo";
import UserMenu from "@/components/common/UserMenu";
import HomeMobileMenu from "@/components/layout/home/HomeMobileMenu";
import ThemeToggle from "@/components/theme/theme-toggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"rounded-full px-3 py-1.5 transition-colors",
		isActive
			? "bg-primary text-primary-foreground"
			: "text-muted-foreground hover:bg-muted hover:text-primary",
	);

const anchorClass = navLinkClass({ isActive: false });

/** Public marketing header: brand, centered anchor nav, auth-aware right side. */
const HomeHeader = () => {
	const { data } = useCurrentUser();
	const user = data?.data;

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
			<div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-3.5">
				<Link to={ROUTES.ROOT} className="justify-self-start">
					<AppLogo className="text-lg" />
				</Link>

				<nav className="hidden items-center gap-1 rounded-full border border-border bg-card/60 p-1 text-sm shadow-sm backdrop-blur md:flex">
					<Link to={ROUTES.CATALOG} className={anchorClass}>
						Courses
					</Link>

					<a href="#why" className={anchorClass}>
						Why
					</a>

					<a href="#how" className={anchorClass}>
						How it works
					</a>

					<a href="#faq" className={anchorClass}>
						FAQ
					</a>
				</nav>

				<div className="flex items-center gap-3 justify-self-end">
					{user ? (
						<nav className="hidden items-center gap-1 text-sm sm:flex">
							<NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>
								Dashboard
							</NavLink>

							<NavLink to={ROUTES.MY_COURSES} className={navLinkClass}>
								Library
							</NavLink>

							<div className="ml-1 border-l border-border pl-3">
								<UserMenu user={user} />
							</div>
						</nav>
					) : (
						<div className="hidden items-center gap-2 sm:flex">
							<Button asChild variant="ghost">
								<Link to={ROUTES.LOGIN}>Log in</Link>
							</Button>

							<Button asChild>
								<Link to={ROUTES.REGISTER}>Sign up</Link>
							</Button>
						</div>
					)}

					<ThemeToggle />
					<HomeMobileMenu user={user} />
				</div>
			</div>
		</header>
	);
};

export default HomeHeader;

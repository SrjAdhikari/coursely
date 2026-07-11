//* src/components/layout/home/HomeHeader.tsx

import { Link, NavLink } from "react-router";

import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useAuth";
import useActiveSection from "@/hooks/useActiveSection";
import ROUTES from "@/routes/paths";

import { Button } from "@/components/ui/button";
import AppLogo from "@/components/common/AppLogo";
import UserMenu from "@/components/common/UserMenu";
import HomeMobileMenu from "@/components/layout/home/HomeMobileMenu";
import ThemeToggle from "@/components/theme/theme-toggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"whitespace-nowrap rounded-full px-4 py-2 transition-colors",
		isActive
			? "bg-muted text-primary"
			: "text-muted-foreground hover:bg-muted hover:text-primary",
	);

const anchorClass = navLinkClass({ isActive: false });

// In-page section links; ids match the homepage sections for scroll-spy.
const anchorNavItems = [
	{ id: "why", label: "Why", href: "#why" },
	{ id: "how", label: "How it works", href: "#how" },
	{ id: "faq", label: "FAQ", href: "#faq" },
];

const sectionIds = anchorNavItems.map((item) => item.id);

/** Public marketing header: brand, centered anchor nav, auth-aware right side. */
const HomeHeader = () => {
	const { data } = useCurrentUser();
	const user = data?.data;

	const activeSection = useActiveSection(sectionIds);

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
			<div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-3.5">
				<Link to={ROUTES.ROOT} className="justify-self-start">
					<AppLogo iconClassName="size-8" />
				</Link>

				<nav className="hidden items-center gap-1 rounded-full border border-border bg-card/60 p-1.5 text-sm shadow-sm backdrop-blur md:flex">
					<Link to={ROUTES.CATALOG} className={anchorClass}>
						Courses
					</Link>

					{anchorNavItems.map((item) => {
						const isActive = activeSection === item.id;
						return (
							<a
								key={item.id}
								href={item.href}
								className={navLinkClass({ isActive })}
								aria-current={isActive ? "true" : undefined}
							>
								{item.label}
							</a>
						);
					})}
				</nav>

				<div className="flex items-center gap-2 justify-self-end sm:gap-3">
					{user ? (
						<nav className="hidden items-center gap-1 text-sm sm:flex">
							<NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>
								Dashboard
							</NavLink>

							<NavLink to={ROUTES.MY_COURSES} className={navLinkClass}>
								My Courses
							</NavLink>
						</nav>
					) : (
						<div className="hidden items-center gap-3 sm:flex">
							<Button asChild variant="ghost" className="hover:text-primary">
								<Link to={ROUTES.LOGIN}>Log in</Link>
							</Button>

							<Button asChild>
								<Link to={ROUTES.REGISTER}>Sign up</Link>
							</Button>
						</div>
					)}

					<span className="hidden h-5 w-px bg-border sm:block" aria-hidden />

					<ThemeToggle />

					{user ? (
						<span className="hidden sm:block">
							<UserMenu user={user} />
						</span>
					) : null}

					<HomeMobileMenu user={user} />
				</div>
			</div>
		</header>
	);
};

export default HomeHeader;

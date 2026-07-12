//* src/components/sidebar/SidebarNav.tsx

import { NavLink } from "react-router";
import { LayoutGrid, BookOpen, UsersRound, CreditCard } from "lucide-react";

import ROUTES from "@/routes/paths";
import { cn } from "@/lib/utils";

// Active item: soft-green fill + semibold foreground; the icon turns accent-green.
const navItemClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"group flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm transition",
		isActive
			? "bg-accent-soft font-semibold text-foreground"
			: "text-muted-foreground hover:bg-muted hover:text-foreground",
	);

// Muted by default; turns accent-green when its NavLink is active (aria-current).
const navIconClass =
	"size-4.5 shrink-0 text-muted-foreground transition-colors group-aria-[current=page]:text-primary";

/** Admin sidebar navigation — the "Manage" section. */
const SidebarNav = () => (
	<div>
		<div className="px-2.5 font-mono text-[10.5px] uppercase tracking-widest text-muted-foreground">
			Manage
		</div>

		<nav className="mt-2 space-y-0.5">
			<NavLink to={ROUTES.ADMIN} end className={navItemClass}>
				<LayoutGrid aria-hidden className={navIconClass} /> Overview
			</NavLink>

			<NavLink to={ROUTES.ADMIN_COURSES} className={navItemClass}>
				<BookOpen aria-hidden className={navIconClass} /> Courses
			</NavLink>

			<NavLink to={ROUTES.ADMIN_STUDENTS} className={navItemClass}>
				<UsersRound aria-hidden className={navIconClass} /> Students
			</NavLink>

			<NavLink to={ROUTES.ADMIN_ENROLLMENTS} className={navItemClass}>
				<CreditCard aria-hidden className={navIconClass} /> Enrollments
			</NavLink>
		</nav>
	</div>
);

export default SidebarNav;

//* src/components/sidebar/SidebarNav.tsx

import { NavLink } from "react-router";
import { LayoutGrid, BookOpen, UsersRound, CreditCard } from "lucide-react";

import ROUTES from "@/routes/paths";
import { cn } from "@/lib/utils";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-2.5 text-sm transition",
		isActive
			? "border-primary/30 bg-primary/10 text-foreground"
			: "text-muted-foreground hover:bg-muted hover:text-foreground",
	);

/** Admin sidebar navigation — the "Manage" section. */
const SidebarNav = () => (
	<div>
		<div className="px-2.5 font-mono text-[10.5px] uppercase tracking-widest text-muted-foreground">
			Manage
		</div>

		<nav className="mt-2 space-y-0.5">
			<NavLink to={ROUTES.ADMIN} end className={navItemClass}>
				<LayoutGrid aria-hidden className="size-4.5" /> Overview
			</NavLink>

			<NavLink to={ROUTES.ADMIN_COURSES} className={navItemClass}>
				<BookOpen aria-hidden className="size-4.5" /> Courses
			</NavLink>

			<NavLink to={ROUTES.ADMIN_STUDENTS} className={navItemClass}>
				<UsersRound aria-hidden className="size-4.5" /> Students
			</NavLink>

			<NavLink to={ROUTES.ADMIN_ENROLLMENTS} className={navItemClass}>
				<CreditCard aria-hidden className="size-4.5" /> Enrollments
			</NavLink>
		</nav>
	</div>
);

export default SidebarNav;

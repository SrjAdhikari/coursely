//* src/components/layout/AdminLayout.tsx

import { Outlet } from "react-router";

import AppLogo from "@/components/common/AppLogo";
import SidebarNav from "@/components/sidebar/SidebarNav";
import SidebarUser from "@/components/sidebar/SidebarUser";
import ThemeToggle from "@/components/theme/theme-toggle";

/**
 * Admin console shell — a fixed sidebar (logo, nav, current user) and a top bar
 * with the theme toggle. Child screens render through the `<Outlet />`.
 */
const AdminLayout = () => (
	<div className="relative z-10 min-h-screen">
		<aside className="fixed inset-y-0 left-0 flex w-62.5 flex-col border-r border-border bg-card/90 p-4 backdrop-blur">
			<div className="flex items-center justify-between px-2 pt-1.5">
				<AppLogo className="text-xl" />

				<span className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
					Admin
				</span>
			</div>

			<div className="mt-6">
				<SidebarNav />
			</div>

			<SidebarUser />
		</aside>

		<div className="ml-62.5 flex min-h-screen flex-col">
			<header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/90 px-9 backdrop-blur">
				<div className="flex-1" />
				<ThemeToggle />
			</header>

			<main className="flex-1 px-9 pb-16 pt-8">
				<Outlet />
			</main>
		</div>
	</div>
);

export default AdminLayout;

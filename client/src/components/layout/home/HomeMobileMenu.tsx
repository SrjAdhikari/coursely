//* src/components/layout/home/HomeMobileMenu.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, LogOut } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/useAuth";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";
import ROUTES from "@/routes/paths";
import type { UserPayload } from "@/types/auth.types";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";

interface HomeMobileMenuProps {
	user: UserPayload | undefined;
}

const marketingLinks = [
	{ label: "Courses", to: ROUTES.CATALOG },
	{ label: "Why", to: "#why" },
	{ label: "How it works", to: "#how" },
	{ label: "FAQ", to: "#faq" },
];

const rowClass =
	"whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/** Hamburger mobile nav for the marketing header (below the `md` breakpoint). */
const HomeMobileMenu = ({ user }: HomeMobileMenuProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const closeMenu = () => setIsOpen(false);

	const handleLogout = () => {
		if (isLoggingOut) return;
		closeMenu();
		logout(undefined, {
			onSuccess: () => {
				queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
				navigate(ROUTES.LOGIN, { replace: true });
			},
			onError: () => {
				toast.error("Couldn't log out. Please try again.");
			},
		});
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Open menu"
					className="md:hidden"
				>
					<Menu aria-hidden />
				</Button>
			</SheetTrigger>

			<SheetContent side="right" className="w-72 gap-0 p-0">
				<SheetHeader className="border-b border-border">
					<SheetTitle>Menu</SheetTitle>
					<SheetDescription className="sr-only">
						Site navigation and account links
					</SheetDescription>
					{user ? (
						<div className="mt-1">
							<p className="truncate text-sm font-medium">{user.name}</p>
							<p className="truncate text-xs text-muted-foreground">
								{user.email}
							</p>
						</div>
					) : null}
				</SheetHeader>

				<nav className="flex flex-col gap-1 p-3">
					{marketingLinks.map((link) =>
						link.to.startsWith("#") ? (
							// Native <a>: <Link> doesn't scroll to a hash.
							<a
								key={link.to}
								href={link.to}
								className={rowClass}
								onClick={closeMenu}
							>
								{link.label}
							</a>
						) : (
							<Link
								key={link.to}
								to={link.to}
								className={rowClass}
								onClick={closeMenu}
							>
								{link.label}
							</Link>
						),
					)}
				</nav>

				<div className="mt-auto border-t border-border p-3">
					{user ? (
						<nav className="flex flex-col gap-1">
							<Link
								to={ROUTES.DASHBOARD}
								className={rowClass}
								onClick={closeMenu}
							>
								Dashboard
							</Link>

							<Link
								to={ROUTES.MY_COURSES}
								className={rowClass}
								onClick={closeMenu}
							>
								My Courses
							</Link>

							<button
								type="button"
								onClick={handleLogout}
								disabled={isLoggingOut}
								className={cn(
									rowClass,
									"flex items-center gap-2 text-left disabled:opacity-50",
								)}
							>
								<LogOut aria-hidden className="size-4" />
								Log out
							</button>
						</nav>
					) : (
						<div className="flex flex-col gap-2">
							<Button asChild variant="ghost">
								<Link to={ROUTES.LOGIN} onClick={closeMenu}>
									Log in
								</Link>
							</Button>

							<Button asChild>
								<Link to={ROUTES.REGISTER} onClick={closeMenu}>
									Sign up
								</Link>
							</Button>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default HomeMobileMenu;

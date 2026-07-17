//* src/components/sidebar/SidebarUser.tsx

import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { toast } from "sonner";

import ROUTES from "@/routes/paths";
import getInitials from "@/lib/getInitials";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

/** Sidebar footer — the current user's avatar; opens a menu with their
 *  read-only role and a logout action. */
const SidebarUser = () => {
	const { data } = useCurrentUser();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();

	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const user = data?.data;
	const roleLabel = user?.role
		? user.role.charAt(0).toUpperCase() + user.role.slice(1)
		: "";

	const handleLogout = () => {
		if (isLoggingOut) return;

		logout(undefined, {
			onSuccess: () => {
				queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
				navigate(ROUTES.LOGIN, { replace: true });
			},
			onError: () => toast.error("Couldn't log out. Please try again."),
		});
	};

	return (
		<div className="mt-auto -mx-4 border-t border-border px-2 pt-3">
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						aria-label="Account menu"
						className="group flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition hover:bg-muted aria-expanded:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<Avatar className="size-9 shrink-0">
							<AvatarImage src={user?.avatarUrl} alt={user?.name} />
							<AvatarFallback className="bg-primary/10 font-medium text-primary">
								{getInitials(user?.name)}
							</AvatarFallback>
						</Avatar>

						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{user?.name}</p>

							<p className="truncate text-xs text-muted-foreground">
								{user?.email}
							</p>
						</div>

						<ChevronsUpDown
							aria-hidden
							className="size-4 shrink-0 text-muted-foreground transition-colors group-aria-expanded:text-foreground"
						/>
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					side="top"
					align="start"
					sideOffset={10}
					className="w-56"
				>
					<DropdownMenuLabel className="font-normal">
						<div className="flex items-center justify-between gap-2">
							<span className="text-xs text-muted-foreground">
								Signed in as
							</span>

							<Badge variant="secondary">{roleLabel}</Badge>
						</div>
					</DropdownMenuLabel>

					<DropdownMenuSeparator />

					<DropdownMenuItem className="cursor-pointer" onSelect={handleLogout}>
						<LogOut aria-hidden />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default SidebarUser;

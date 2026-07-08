//* src/components/common/UserMenu.tsx

import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import getInitials from "@/lib/getInitials";
import { useLogout } from "@/hooks/useAuth";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";

import ROUTES from "@/routes/paths";
import type { UserPayload } from "@/types/auth.types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
	user: UserPayload;
}

/** Avatar trigger that opens the account menu — name, email, and log out. */
const UserMenu = ({ user }: UserMenuProps) => {
	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const handleLogout = () => {
		if (isLoggingOut) return;

		logout(undefined, {
			onSuccess: () => {
				queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
				navigate(ROUTES.LOGIN, { replace: true });
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Account menu"
					className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					<Avatar>
						<AvatarFallback className="bg-primary/10 font-medium text-primary">
							{getInitials(user?.name)}
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<p className="truncate text-sm font-medium">{user?.name}</p>
					<p className="truncate text-xs text-muted-foreground">
						{user?.email}
					</p>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuItem className="cursor-pointer" onSelect={handleLogout}>
					<LogOut aria-hidden />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserMenu;

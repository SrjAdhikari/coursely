//* src/components/sidebar/SidebarUser.tsx

import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";
import ROUTES from "@/routes/paths";

/** Sidebar footer — the current user (name + role) and a logout button. */
const SidebarUser = () => {
	const { data } = useCurrentUser();
	const { mutate: logout } = useLogout();

	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const onLogout = () =>
		logout(undefined, {
			onSuccess: () => {
				queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
				navigate(ROUTES.LOGIN, { replace: true });
			},
		});

	return (
		<div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
			<span className="size-9 shrink-0 rounded-full bg-linear-to-br from-muted to-input" />
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{data?.data.name}</p>

				<p className="truncate font-mono text-[11px] text-muted-foreground">
					{data?.data.role}
				</p>
			</div>

			<button
				type="button"
				aria-label="Log out"
				onClick={onLogout}
				className="flex size-8 items-center justify-center rounded-lg border border-input text-muted-foreground hover:border-muted-foreground hover:text-foreground"
			>
				<LogOut aria-hidden className="size-4" />
			</button>
		</div>
	);
};

export default SidebarUser;

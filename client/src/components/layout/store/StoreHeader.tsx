//* src/components/layout/store/StoreHeader.tsx

import { Link } from "react-router";

import { useCurrentUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import AppLogo from "@/components/common/AppLogo";
import ROUTES from "@/routes/paths";

/** Minimal shared header for the store pages (a fuller public header comes later). */
const StoreHeader = () => {
	const { data } = useCurrentUser();
	const user = data?.data;

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
				<Link to={ROUTES.ROOT}>
					<AppLogo className="text-lg" />
				</Link>

				<nav className="flex items-center gap-3 text-sm">
					<Link
						to={ROUTES.CATALOG}
						className="text-muted-foreground hover:text-primary"
					>
						Browse
					</Link>

					{user ? (
						<>
							<Link
								to={ROUTES.DASHBOARD}
								className="text-muted-foreground hover:text-primary"
							>
								Dashboard
							</Link>

							<Link
								to={ROUTES.MY_COURSES}
								className="text-muted-foreground hover:text-primary"
							>
								Library
							</Link>

							<span className="ml-1 border-l border-border pl-3 text-foreground">
								{user.name}
							</span>
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
			</div>
		</header>
	);
};

export default StoreHeader;

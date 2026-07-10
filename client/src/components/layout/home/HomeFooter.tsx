import { Link } from "react-router";

import AppLogo from "@/components/common/AppLogo";
import { useCurrentUser } from "@/hooks/useAuth";
import ROUTES from "@/routes/paths";

const productLinks = [
	{ label: "Browse courses", to: ROUTES.CATALOG },
	{ label: "How it works", to: "#how" },
	{ label: "FAQ", to: "#faq" },
];

const linkClass = "block text-muted-foreground hover:text-primary";

// Hash targets need a native anchor to scroll; react-router <Link> wouldn't.
const FooterLink = ({ to, label }: { to: string; label: string }) =>
	to.startsWith("#") ? (
		<a href={to} className={linkClass}>
			{label}
		</a>
	) : (
		<Link to={to} className={linkClass}>
			{label}
		</Link>
	);

const HomeFooter = () => {
	const { data } = useCurrentUser();
	const user = data?.data;

	// Mirror the header: authed users get app links, guests get auth links.
	const accountLinks = user
		? [
				{ label: "Dashboard", to: ROUTES.DASHBOARD },
				{ label: "My courses", to: ROUTES.MY_COURSES },
			]
		: [
				{ label: "Log in", to: ROUTES.LOGIN },
				{ label: "Sign up", to: ROUTES.REGISTER },
			];

	return (
		<footer className="border-t border-border bg-card/40">
			<div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
				<div className="space-y-3">
					<AppLogo />
					<p className="max-w-xs text-sm text-muted-foreground">
						Project-driven web development courses. Buy once, own forever, learn
						at your own pace.
					</p>
				</div>

				<nav aria-label="Product" className="space-y-2 text-sm">
					<p className="text-xs uppercase tracking-wider text-muted-foreground">
						Product
					</p>

					{productLinks.map((link) => (
						<FooterLink key={link.label} to={link.to} label={link.label} />
					))}
				</nav>

				<nav aria-label="Account" className="space-y-2 text-sm">
					<p className="text-xs uppercase tracking-wider text-muted-foreground">
						Account
					</p>

					{accountLinks.map((link) => (
						<FooterLink key={link.label} to={link.to} label={link.label} />
					))}
				</nav>
			</div>

			<div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground">
				&copy; 2026 Coursely. All rights reserved.
			</div>
		</footer>
	);
};

export default HomeFooter;

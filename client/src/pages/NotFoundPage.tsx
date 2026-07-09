//* src/pages/NotFoundPage.tsx

import { Link } from "react-router";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/paths";

/** Catch-all for unknown URLs — keeps the user oriented instead of a blank screen. */
const NotFoundPage = () => (
	<div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center py-16 text-center">
		<div className="mb-5 flex size-16 items-center justify-center rounded-full border border-border bg-card">
			<Compass className="size-9 text-muted-foreground" />
		</div>

		<h1 className="font-heading text-2xl font-semibold">Page not found</h1>
		<p className="mt-2.5 text-sm text-muted-foreground">
			The page you're looking for doesn't exist or may have moved.
		</p>

		<div className="mt-6 flex flex-wrap justify-center gap-3">
			<Button asChild>
				<Link to={ROUTES.ROOT}>Back to home</Link>
			</Button>

			<Button asChild variant="outline">
				<Link to={ROUTES.CATALOG}>Browse courses</Link>
			</Button>
		</div>
	</div>
);

export default NotFoundPage;

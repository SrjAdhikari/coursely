//* src/pages/CheckoutCancelPage.tsx

import { Link } from "react-router";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/paths";

/** Stripe checkout was abandoned — nothing was charged. */
const CheckoutCancelPage = () => (
	<div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
		<div className="mb-5 flex size-16 items-center justify-center rounded-full border border-border bg-card">
			<XCircle className="size-9 text-muted-foreground" />
		</div>

		<h1 className="font-heading text-2xl font-semibold">Checkout canceled</h1>
		<p className="mt-2.5 text-sm text-muted-foreground">
			No payment was taken. Your card was not charged. Pick up where you left
			off whenever you're ready.
		</p>

		<div className="mt-6 flex flex-wrap justify-center gap-3">
			<Button asChild>
				<Link to={ROUTES.CATALOG}>Browse courses</Link>
			</Button>

			<Button asChild variant="outline">
				<Link to={ROUTES.MY_COURSES}>My Courses</Link>
			</Button>
		</div>
	</div>
);

export default CheckoutCancelPage;

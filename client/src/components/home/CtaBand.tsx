//* src/components/home/CtaBand.tsx

import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/paths";

const CtaBand = () => (
	<section className="mx-auto max-w-6xl px-5 pb-16">
		<div className="rounded-3xl border border-accent-line bg-accent-soft px-6 py-14 text-center">
			<p className="text-xs uppercase tracking-widest text-primary">
				ready when you are
			</p>

			<h2 className="mx-auto mt-4 max-w-2xl text-4xl">
				Start learning today.
			</h2>

			<p className="mx-auto mt-4 max-w-md text-muted-foreground">
				Preview any course for free, then unlock lifetime access with a single
				payment. Your next skill is one lesson away.
			</p>

			<div className="mt-8 flex flex-wrap justify-center gap-3">
				<Button asChild size="lg">
					<Link to={ROUTES.REGISTER}>Create free account</Link>
				</Button>

				<Button asChild size="lg" variant="outline">
					<Link to={ROUTES.CATALOG}>Browse courses</Link>
				</Button>
			</div>
		</div>
	</section>
);

export default CtaBand;

//* src/components/home/ValueProps.tsx

import {
	Infinity as InfinityIcon,
	CodeXml,
	Clock,
	ShieldCheck,
} from "lucide-react";

const valueProps = [
	{
		icon: InfinityIcon,
		title: "Lifetime access",
		body: "Buy a course once and it's yours forever. No recurring fees, no expiry, no lock-out.",
	},
	{
		icon: CodeXml,
		title: "Project-based learning",
		body: "Every course builds toward something real: you learn by writing code, not just watching it.",
	},
	{
		icon: Clock,
		title: "Learn at your own pace",
		body: "Your progress saves as you go. Close the tab and resume the exact lesson later, anywhere.",
	},
	{
		icon: ShieldCheck,
		title: "Secure Stripe checkout",
		body: "Payments are handled end-to-end by Stripe. We never see or store your card details.",
	},
];

const ValueProps = () => (
	<section id="why" className="mx-auto max-w-6xl px-5 py-16">
		<div className="mx-auto mb-9 max-w-xl text-center">
			<p className="text-xs uppercase tracking-widest text-primary">
				why Manakuru
			</p>

			<h2 className="mt-3 text-4xl">
				Built for people who want to actually ship
			</h2>

			<p className="mt-3 text-muted-foreground">
				No subscriptions to babysit, no fluff between you and the code. Just
				courses you own and can finish on your own terms.
			</p>
		</div>

		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{valueProps.map(({ icon: Icon, title, body }) => (
				<div
					key={title}
					className="rounded-xl border border-border bg-card p-6 transition duration-200 hover:-translate-y-1 hover:border-accent-line"
				>
					<span className="mb-4 grid size-11 place-items-center rounded-lg border border-accent-line bg-accent-soft text-primary">
						<Icon className="size-5" aria-hidden />
					</span>
					<h4 className="text-lg">{title}</h4>
					<p className="mt-2 text-sm text-muted-foreground">{body}</p>
				</div>
			))}
		</div>
	</section>
);

export default ValueProps;

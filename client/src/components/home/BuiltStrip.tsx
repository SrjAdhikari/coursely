//* src/components/home/BuiltStrip.tsx

import { CreditCard, KeyRound, Zap } from "lucide-react";

const buildCards = [
	{
		idx: "01",
		icon: Zap,
		title: "Instant-start video",
		body: "Lessons stream from Cloudflare R2 with zero egress cost — so playback starts fast and there's no per-view bandwidth bill to pass on to you.",
	},
	{
		idx: "02",
		icon: KeyRound,
		title: "Signed-URL delivery",
		body: "Each lesson plays through a short-lived signed URL. Only enrolled students get one, and it expires — so links can't be shared or leaked.",
	},
	{
		idx: "03",
		icon: CreditCard,
		title: "One-time Stripe checkout",
		body: "Buy a course once through Stripe. No subscription, no card details stored on our side, and lifetime access the moment payment clears.",
	},
];

const BuiltStrip = () => (
	<section id="built" className="mx-auto max-w-6xl px-5 py-16">
		<div className="mb-9 max-w-2xl">
			<p className="text-xs uppercase tracking-widest text-primary">
				how it's built
			</p>

			<h2 className="mt-3 text-4xl">
				Fast to watch, cheap to run, honest by design
			</h2>

			<p className="mt-3 text-muted-foreground">
				No black boxes. Here's the actual engineering that makes lessons start
				instantly and keeps a solo-run platform sustainable.
			</p>

			<p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
				<span>
					Egress <b className="font-semibold text-primary">₹0</b>
				</span>

				<span aria-hidden>·</span>
				<span>
					Delivery <b className="font-semibold text-primary">signed URLs</b>
				</span>

				<span aria-hidden>·</span>
				<span>
					Payments <b className="font-semibold text-primary">one-time</b>
				</span>
			</p>
		</div>

		<div className="grid gap-5 md:grid-cols-3">
			{buildCards.map(({ idx, icon: Icon, title, body }) => (
				<div
					key={idx}
					className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition duration-200 hover:-translate-y-1 hover:border-accent-line hover:shadow-card"
				>
					<span className="absolute right-5 top-5 text-xs text-muted-foreground">
						{idx}
					</span>

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

export default BuiltStrip;

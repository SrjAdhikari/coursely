//* src/components/home/HowItWorks.tsx

const steps = [
	{
		num: 1,
		title: "Browse the catalog",
		body: "Explore every course and watch the free preview lessons — no account, no card required.",
	},
	{
		num: 2,
		title: "Buy once",
		body: "When a course is right for you, one secure Stripe payment unlocks it in full, for life.",
	},
	{
		num: 3,
		title: "Learn forever",
		body: "Watch at your own pace on any device. Your progress saves so you always pick up where you stopped.",
	},
];

const HowItWorks = () => (
	<section id="how" className="mx-auto max-w-6xl px-5 py-16">
		<div className="mx-auto mb-9 max-w-xl text-center">
			<p className="text-xs uppercase tracking-widest text-primary">
				how it works
			</p>

			<h2 className="mt-3 text-3xl">
				From browsing to building in three steps
			</h2>

			<p className="mt-3 text-muted-foreground">
				No trial timers, no signup wall to look around. Here's the whole thing.
			</p>
		</div>

		<div className="grid gap-5 md:grid-cols-3">
			{steps.map((step) => (
				<div
					key={step.num}
					className="relative rounded-xl border border-border bg-card p-7 transition duration-200 hover:-translate-y-1 hover:border-accent-line"
				>
					<span className="grid size-10 place-items-center rounded-lg border border-accent-line bg-accent-soft font-bold text-primary">
						{step.num}
					</span>

					<h4 className="mt-5 text-lg">{step.title}</h4>
					<p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
				</div>
			))}
		</div>
	</section>
);

export default HowItWorks;

//* src/components/home/HomeFaq.tsx

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
	{
		question: "Is this a new platform?",
		answer:
			"Yes — Coursely is newly built, and I'd rather be upfront than fake a crowd. That's exactly why every course has free preview lessons: watch real lessons before you decide. Payment is one-time with lifetime access, so there's no recurring commitment. Live today: the full catalog, the video player with saved progress, secure Stripe checkout, and your personal course library. On the roadmap: lesson notes, in-lesson resources, and Q&A.",
	},
	{
		question: "Do I pay once or subscribe?",
		answer:
			"Once. Every course is a single one-time purchase with lifetime access — there are no subscriptions, renewals, or expiry dates.",
	},
	{
		question: "Can I try a course before buying?",
		answer:
			"Yes. Every course has a handful of free preview lessons you can watch in full — some without even creating an account — so you know exactly what you're getting.",
	},
	{
		question: "What devices can I learn on?",
		answer:
			"Any modern browser on desktop, tablet, or mobile. Your progress is tied to your account, so it follows you across every device you sign in on.",
	},
	{
		question: "Is checkout secure?",
		answer:
			"Payments are processed end-to-end by Stripe. Your card details go straight to Stripe — Coursely never sees or stores them.",
	},
	{
		question: "How long do I keep access?",
		answer:
			"Forever. Once you own a course it stays in your library with full access — rewatch any lesson as many times as you like, whenever you like.",
	},
];

const HomeFaq = () => (
	<section id="faq" className="mx-auto max-w-6xl px-5 py-16">
		<div className="mx-auto mb-9 max-w-xl text-center">
			<p className="text-xs uppercase tracking-widest text-primary">
				questions, answered
			</p>
			<h2 className="mt-3 text-3xl">Everything before you buy</h2>
		</div>

		<Accordion
			type="single"
			collapsible
			defaultValue="item-0"
			className="mx-auto max-w-3xl space-y-3"
		>
			{faqItems.map((item, index) => (
				<AccordionItem
					key={item.question}
					value={`item-${index}`}
					className="rounded-xl border bg-card px-5 last:border-b data-[state=open]:border-input"
				>
					<AccordionTrigger className="text-base font-medium hover:no-underline">
						{item.question}
					</AccordionTrigger>

					<AccordionContent className="max-w-prose leading-relaxed text-muted-foreground">
						{item.answer}
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	</section>
);

export default HomeFaq;

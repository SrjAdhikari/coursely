//* src/components/home/TechMarquee.tsx

import { cn } from "@/lib/utils";

const techStack = [
	"React 19",
	"TypeScript",
	"Cloudflare R2",
	"MongoDB",
	"Stripe",
	"Tailwind",
	"Node/Express",
];

// Seamless loop: two identical tracks translated -50%. Under reduced-motion the
// animation is disabled and the row reflows to a static, centered, wrapped list.
const marqueeCss = `
.coursely-marquee{
	-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
	mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
}
.coursely-marquee-track{animation:coursely-marquee-scroll 32s linear infinite}
@keyframes coursely-marquee-scroll{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){
	.coursely-marquee{-webkit-mask-image:none;mask-image:none}
	.coursely-marquee-track{animation:none;width:auto;flex-wrap:wrap;justify-content:center;gap:.5rem 1.75rem}
	.coursely-marquee-item{margin-right:0}
	.coursely-marquee-dup{display:none}
}
`;

interface MarqueeItemProps {
	label: string;
	duplicate?: boolean;
}

const MarqueeItem = ({ label, duplicate }: MarqueeItemProps) => (
	<span
		aria-hidden={duplicate || undefined}
		className={cn(
			"coursely-marquee-item mr-10 inline-flex items-center gap-2 whitespace-nowrap text-base font-medium text-muted-foreground/80",
			duplicate && "coursely-marquee-dup",
		)}
	>
		<span className="size-1.5 shrink-0 rotate-45 bg-primary/75" />
		{label}
	</span>
);

const TechMarquee = () => (
	<section className="mx-auto max-w-6xl px-5 pb-16">
		<div className="text-center">
			<p className="mb-5 text-xs uppercase tracking-widest text-muted-foreground">
				Built on
			</p>

			<div
				className="coursely-marquee overflow-hidden"
				aria-label="Technology stack Coursely is built on"
			>
				<div className="coursely-marquee-track flex w-max">
					{techStack.map((tech) => (
						<MarqueeItem key={tech} label={tech} />
					))}

					{techStack.map((tech) => (
						<MarqueeItem key={`dup-${tech}`} label={tech} duplicate />
					))}
				</div>
			</div>
		</div>

		<style>{marqueeCss}</style>
	</section>
);

export default TechMarquee;

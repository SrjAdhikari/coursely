//* src/components/home/FounderNote.tsx

import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import founderPhoto from "@/assets/founder.jpg";

const FounderNote = () => (
	<section id="founder" className="mx-auto max-w-6xl px-5 py-16">
		<figure className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-muted to-card p-8 sm:p-12">
			<span
				className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary to-transparent"
				aria-hidden
			/>

			<span className="text-5xl leading-none text-primary/50" aria-hidden>
				“
			</span>

			<p className="mt-3 text-xs uppercase tracking-widest text-primary">
				why I built Manakuru
			</p>

			<blockquote className="mt-4 space-y-4">
				<p className="text-lg leading-relaxed text-foreground">
					Most platforms rent you access. Stop paying and your courses
					disappear. I wanted the opposite: buy a course once, own it for good,
					and learn at your own pace. So Manakuru is built around project-based
					lessons and a player that remembers exactly where you stopped.
				</p>

				<p className="text-base leading-relaxed text-muted-foreground">
					No subscription treadmill, no fake urgency, and no numbers I can't
					back up. You preview lessons for free, pay once for a course, and keep
					it for good. If that's how you'd want to learn, you're exactly who I
					made this for.
				</p>
			</blockquote>

			<figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-6">
				<Avatar className="size-11 shrink-0">
					<AvatarImage src={founderPhoto} alt="Suraj Adhikari" />
					<AvatarFallback className="bg-linear-to-br from-primary to-accent-line text-primary-foreground">
						<UserRound className="size-5 opacity-75" aria-hidden />
					</AvatarFallback>
				</Avatar>

				<div>
					<p className="font-semibold">Suraj Adhikari</p>
					<p className="text-xs text-muted-foreground">
						Solo builder · Full Stack Engineer
					</p>
				</div>
			</figcaption>
		</figure>
	</section>
);

export default FounderNote;

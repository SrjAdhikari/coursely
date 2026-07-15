//* src/components/Loader.tsx

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

// A lime conic ring, masked to a thin annulus, that sweeps around the cap mark.
const ringStyle = {
	background:
		"conic-gradient(from 0deg, transparent 8%, var(--primary) 92%, var(--primary))",
	WebkitMask:
		"radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
	mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
} as const;

/**
 * Branded loader — a lime conic ring sweeping around the graduation-cap mark.
 * Full-screen overlay by default (page / route loading, so the one spinner spans
 * the whole load). Pass a `className` only to size it inline inside a box — e.g.
 * a video player or a card (`aspect-video`, `min-h-[40vh]`).
 */
const Loader = ({ className }: { className?: string }) => (
	<div
		role="status"
		aria-label="Loading"
		className={cn(
			"flex flex-col items-center justify-center gap-3",
			className ?? "fixed inset-0 z-50 bg-background",
		)}
	>
		<div className="relative grid size-16 place-items-center">
			<span
				aria-hidden
				style={ringStyle}
				className="absolute inset-0 rounded-full motion-safe:animate-spin"
			/>
			<GraduationCap aria-hidden className="size-7 text-primary" />
		</div>

		<span className="font-mono text-sm font-medium text-muted-foreground">
			Loading…
		</span>
	</div>
);

export default Loader;

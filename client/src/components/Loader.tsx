//* src/components/Loader.tsx

import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Centered spinner. Full-screen by default (auth checks); pass `className` to
 * override the height for inline use, e.g. inside a card or table body.
 */
const Loader = ({ className }: { className?: string }) => (
	<div
		role="status"
		aria-label="Loading"
		className={cn(
			"flex flex-col items-center justify-center gap-2 text-primary",
			className ?? "min-h-screen",
		)}
	>
		<LoaderIcon className="size-6 animate-spin" aria-hidden />
		<span className="text-base font-mono font-medium">Loading...</span>
	</div>
);

export default Loader;

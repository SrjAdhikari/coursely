//* src/components/home/ProductFrame.tsx

import type { ReactNode } from "react";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProductFrameProps {
	url?: string;
	imageSrc?: string;
	alt?: string;
	children?: ReactNode;
	className?: string;
}

/** Reusable browser-chrome frame. Renders an `<img>` when `imageSrc` is given
 *  (the swap-in point for real screenshots) else the placeholder `children`. */
const ProductFrame = ({
	url,
	imageSrc,
	alt,
	children,
	className,
}: ProductFrameProps) => (
	<div
		className={cn(
			"overflow-hidden rounded-2xl border border-input bg-card shadow-card",
			className,
		)}
	>
		<div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
			<span className="flex gap-1.5" aria-hidden>
				<span className="block size-2.5 rounded-full bg-input" />
				<span className="block size-2.5 rounded-full bg-input" />
				<span className="block size-2.5 rounded-full bg-input" />
			</span>

			{url ? (
				<span className="mx-auto flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
					<Lock className="size-3 text-primary" aria-hidden />
					{url}
				</span>
			) : null}
		</div>

		{imageSrc ? (
			<img src={imageSrc} alt={alt ?? ""} className="w-full" />
		) : (
			children
		)}
	</div>
);

export default ProductFrame;

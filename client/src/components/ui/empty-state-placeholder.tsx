//* src/components/ui/empty-state-placeholder.tsx

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStatePlaceholderProps {
	icon: LucideIcon;
	title: string;
	description: ReactNode;
	children?: ReactNode;
}

/**
 * Shared layout for content-area placeholders (no data, no search results, load
 * failure, etc.) — an icon-in-frame visual with a heading, description and an
 * optional CTA slot below.
 */
const EmptyStatePlaceholder = ({
	icon: Icon,
	title,
	description,
	children,
}: EmptyStatePlaceholderProps) => (
	<div className="flex min-h-[60vh] items-center justify-center py-10 text-muted-foreground">
		<div className="flex flex-col items-center gap-6">
			<div className="rounded-3xl bg-primary/5 p-6">
				<Icon
					aria-hidden="true"
					className="size-14 text-primary md:size-16"
					strokeWidth={1}
				/>
			</div>

			<div className="text-center">
				<h2 className="text-lg font-medium text-foreground md:text-xl">
					{title}
				</h2>
				<p className="mt-1 text-sm font-mono">{description}</p>
			</div>

			{children}
		</div>
	</div>
);

export default EmptyStatePlaceholder;

//* src/components/common/RowActionButton.tsx

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const baseClass = "cursor-pointer font-mono text-[13px] transition-colors";
// Destructive rows read red at rest (matching the Deactivate action), not just on hover.
const variantClass = {
	default: "text-muted-foreground hover:text-primary",
	destructive: "text-destructive hover:text-destructive/80",
};

/** Text button for a table row action (Edit / Delete / Manage …). */
const RowActionButton = ({
	variant = "default",
	className,
	...props
}: ComponentProps<"button"> & { variant?: "default" | "destructive" }) => (
	<button
		type="button"
		className={cn(baseClass, variantClass[variant], className)}
		{...props}
	/>
);

/** Right-aligned container laying out one or more row-action buttons. */
const RowActions = ({ children }: { children: ReactNode }) => (
	<div className="flex justify-end gap-3.5">{children}</div>
);

export { RowActionButton, RowActions };

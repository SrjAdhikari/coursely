//* src/components/common/RowActionButton.tsx

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const baseClass =
	"cursor-pointer font-mono text-[13px] text-muted-foreground transition-colors";
const hoverClass = {
	default: "hover:text-primary",
	destructive: "hover:text-destructive",
};

/** Text button for a table row action (Edit / Delete / Manage …). */
const RowActionButton = ({
	variant = "default",
	className,
	...props
}: ComponentProps<"button"> & { variant?: "default" | "destructive" }) => (
	<button
		type="button"
		className={cn(baseClass, hoverClass[variant], className)}
		{...props}
	/>
);

/** Right-aligned container laying out one or more row-action buttons. */
const RowActions = ({ children }: { children: ReactNode }) => (
	<div className="flex justify-end gap-3.5">{children}</div>
);

export { RowActionButton, RowActions };

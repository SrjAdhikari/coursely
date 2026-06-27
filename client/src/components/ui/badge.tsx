//* src/components/ui/badge.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground",
				secondary: "border-transparent bg-secondary text-secondary-foreground",
				destructive:
					"border-destructive/30 bg-destructive/10 text-destructive",
				outline: "border-border text-foreground",
				muted: "border-border bg-muted text-muted-foreground",
				success: "border-success/30 bg-success-muted text-success",
				accent: "border-accent-line bg-accent-soft text-primary",
			},
		},
		defaultVariants: { variant: "muted" },
	},
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "span";

	return (
		<Comp
			data-slot="badge"
			data-variant={variant ?? "muted"}
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };

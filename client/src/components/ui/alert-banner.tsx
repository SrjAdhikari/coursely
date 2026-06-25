//* src/components/ui/alert-banner.tsx

import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "error" | "warning" | "info";

interface AlertBannerProps {
	variant: Variant;
	children: ReactNode;
	className?: string;
}

const variantStyles: Record<Variant, string> = {
	error: "border-destructive/30 bg-destructive/10 text-destructive",
	warning: "border-amber-500/30 bg-amber-500/10 text-amber-500",
	info: "border-sky-500/30 bg-sky-500/10 text-sky-500",
};

const variantIcons: Record<Variant, ReactNode> = {
	error: <AlertCircle className="mt-0.5 size-4 shrink-0" />,
	warning: <AlertTriangle className="mt-0.5 size-4 shrink-0" />,
	info: <Info className="mt-0.5 size-4 shrink-0" />,
};

const variantRoles: Record<Variant, "alert" | "status"> = {
	error: "alert",
	warning: "status",
	info: "status",
};

/**
 * Tinted banner for form-level feedback that doesn't belong to a single field —
 * wrong credentials, deactivated account, etc. Rendered above the form fields.
 */
const AlertBanner = ({ variant, children, className }: AlertBannerProps) => (
	<div
		role={variantRoles[variant]}
		className={cn(
			"flex items-start gap-3 rounded-lg border p-3 text-sm font-mono",
			variantStyles[variant],
			className,
		)}
	>
		{variantIcons[variant]}
		<div className="flex-1">{children}</div>
	</div>
);

export default AlertBanner;

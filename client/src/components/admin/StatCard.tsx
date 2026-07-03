//* src/components/admin/StatCard.tsx

import type { ReactNode } from "react";

interface StatCardProps {
	label: string;
	value: ReactNode;
	sub?: ReactNode;
}

/** Simple Overview stat tile: uppercase label, large value, optional sub-line. */
const StatCard = ({ label, value, sub }: StatCardProps) => (
	<div className="rounded-xl border border-border bg-card p-5">
		<div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
			{label}
		</div>

		<div className="mt-2 font-heading text-3xl font-bold">{value}</div>
		{sub ? (
			<div className="mt-1 font-mono text-xs text-primary">{sub}</div>
		) : null}
	</div>
);

export default StatCard;

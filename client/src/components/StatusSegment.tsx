//* src/components/StatusSegment.tsx

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
	{ value: false, label: "Draft" },
	{ value: true, label: "Live" },
] as const;

interface StatusSegmentProps {
	value: boolean;
	onChange: (value: boolean) => void;
}

/** Draft/Live segmented toggle for a course's publish status. */
const StatusSegment = ({ value, onChange }: StatusSegmentProps) => (
	<div className="space-y-2">
		<Label>Status</Label>
		<div
			role="group"
			aria-label="Status"
			className="inline-flex gap-1 rounded-lg border border-input bg-background p-1"
		>
			{STATUS_OPTIONS.map((opt) => (
				<button
					key={opt.label}
					type="button"
					aria-pressed={value === opt.value}
					onClick={() => onChange(opt.value)}
					className={cn(
						"rounded-md px-4 py-1.5 font-mono text-xs transition",
						value === opt.value
							? "bg-primary font-bold text-primary-foreground"
							: "text-muted-foreground",
					)}
				>
					{opt.label}
				</button>
			))}
		</div>
	</div>
);

export default StatusSegment;

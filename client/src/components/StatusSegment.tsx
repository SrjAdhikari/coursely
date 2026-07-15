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
	liveDisabled?: boolean;
}

/** Draft/Live segmented toggle for a course's publish status. */
const StatusSegment = ({
	value,
	onChange,
	liveDisabled = false,
}: StatusSegmentProps) => (
	<div className="space-y-2">
		<Label>Status</Label>
		<div
			role="group"
			aria-label="Status"
			className="inline-flex gap-1 rounded-lg border border-input bg-background p-1"
		>
			{STATUS_OPTIONS.map((option) => {
				// Only "Live" is gated; "Draft" stays interactive.
				const isDisabled = option.value === true && liveDisabled;
				return (
					<button
						key={option.label}
						type="button"
						aria-pressed={value === option.value}
						aria-disabled={isDisabled}
						disabled={isDisabled}
						onClick={() => onChange(option.value)}
						className={cn(
							"rounded-md px-4 py-1.5 font-mono text-xs transition disabled:cursor-not-allowed disabled:opacity-40",
							value === option.value
								? "bg-primary font-bold text-primary-foreground"
								: "text-muted-foreground",
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>

		{liveDisabled && (
			<p className="text-xs text-muted-foreground">
				Upload at least one lesson video to publish.
			</p>
		)}
	</div>
);

export default StatusSegment;

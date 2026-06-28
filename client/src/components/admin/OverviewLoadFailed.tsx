//* src/components/admin/OverviewLoadFailed.tsx

import { RefreshCw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";

interface OverviewLoadFailedProps {
	onRetry: () => void;
}

/**
 * Shown when the overview's underlying queries fail. Static, friendly copy
 * (never the backend's raw `error.message`); a single retry refetches both the
 * courses and students lists the dashboard is built from.
 */
const OverviewLoadFailed = ({ onRetry }: OverviewLoadFailedProps) => (
	<div role="alert">
		<EmptyStatePlaceholder
			icon={ServerCrash}
			title="Couldn't load the overview"
			description="Something went wrong while loading your dashboard. Check your connection and try again."
		>
			<Button
				variant="outline"
				onClick={onRetry}
				className="cursor-pointer font-mono"
			>
				<RefreshCw aria-hidden="true" className="size-4" />
				Try again
			</Button>
		</EmptyStatePlaceholder>
	</div>
);

export default OverviewLoadFailed;

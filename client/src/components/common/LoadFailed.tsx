//* src/components/common/LoadFailed.tsx

import { Link } from "react-router";
import { RefreshCw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";

interface LoadFailedProps {
	title: string;
	description: string;
	onRetry: () => void;
	backTo?: string;
	backLabel?: string;
}

/**
 * Reusable load-failure state for a failed query. Renders an alert region with
 * static, friendly copy (never the backend's raw `error.message`), a retry, and
 * an optional link back to a parent screen.
 */
const LoadFailed = ({
	title,
	description,
	onRetry,
	backTo,
	backLabel,
}: LoadFailedProps) => (
	<div role="alert">
		<EmptyStatePlaceholder
			icon={ServerCrash}
			title={title}
			description={description}
		>
			<div className="flex gap-3">
				<Button
					variant="outline"
					onClick={onRetry}
					className="cursor-pointer font-mono"
				>
					<RefreshCw aria-hidden="true" className="size-4" />
					Try again
				</Button>

				{backTo && backLabel && (
					<Button asChild variant="ghost" className="cursor-pointer font-mono">
						<Link to={backTo}>{backLabel}</Link>
					</Button>
				)}
			</div>
		</EmptyStatePlaceholder>
	</div>
);

export default LoadFailed;

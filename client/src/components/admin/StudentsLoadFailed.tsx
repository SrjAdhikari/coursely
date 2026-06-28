//* src/components/admin/StudentsLoadFailed.tsx

import { RefreshCw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";

interface StudentsLoadFailedProps {
	onRetry: () => void;
}

/**
 * Shown when the admin students query fails. Uses static, friendly copy (never
 * the backend's raw `error.message`) and offers a retry. The list endpoint has
 * no resource-specific failure codes, so a single fallback message covers it.
 */
const StudentsLoadFailed = ({ onRetry }: StudentsLoadFailedProps) => (
	<div role="alert">
		<EmptyStatePlaceholder
			icon={ServerCrash}
			title="Couldn't load students"
			description="Something went wrong while loading your students. Check your connection and try again."
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

export default StudentsLoadFailed;
